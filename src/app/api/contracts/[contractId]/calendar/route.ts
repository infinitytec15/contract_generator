import { createClient } from "../../../../../../supabase/server";
import { NextRequest, NextResponse } from "next/server";

// GET: Retrieve calendar events for a contract
export async function GET(
  request: NextRequest,
  { params }: { params: { contractId: string } },
) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    // Get URL parameters for filtering
    const url = new URL(request.url);
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");
    const eventType = url.searchParams.get("eventType");

    // Build query
    let query = supabase
      .from("calendar_events")
      .select("*")
      .eq("contract_id", params.contractId);

    if (startDate) {
      query = query.gte("start_date", startDate);
    }

    if (endDate) {
      query = query.lte("start_date", endDate);
    }

    if (eventType) {
      query = query.eq("event_type", eventType);
    }

    // Execute query
    const { data: events, error } = await query.order("start_date");

    if (error) {
      console.error("Error fetching calendar events:", error);
      return NextResponse.json(
        { error: "Failed to fetch calendar events" },
        { status: 500 },
      );
    }

    // Get attendees for each event
    const eventsWithAttendees = await Promise.all(
      (events || []).map(async (event) => {
        const { data: attendees, error: attendeesError } = await supabase
          .from("event_attendees")
          .select("id, name, email, status")
          .eq("event_id", event.id);

        if (attendeesError) {
          console.error("Error fetching attendees:", attendeesError);
          return event;
        }

        return { ...event, attendees: attendees || [] };
      }),
    );

    return NextResponse.json({ events: eventsWithAttendees });
  } catch (err: any) {
    console.error("Unexpected error in calendar events API:", err);
    return NextResponse.json(
      { error: err.message || "An unexpected error occurred" },
      { status: 500 },
    );
  }
}

// POST: Create a new calendar event
export async function POST(
  request: NextRequest,
  { params }: { params: { contractId: string } },
) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    // Get request body
    const {
      title,
      description,
      event_type,
      start_date,
      end_date,
      all_day,
      location,
      color,
      reminder_days,
      attendees,
    } = await request.json();

    // Validate required fields
    if (!title || !event_type || !start_date) {
      return NextResponse.json(
        { error: "Title, event type, and start date are required" },
        { status: 400 },
      );
    }

    // Insert event
    const { data: event, error } = await supabase
      .from("calendar_events")
      .insert({
        contract_id: params.contractId,
        title,
        description: description || null,
        event_type,
        start_date,
        end_date: end_date || null,
        all_day: all_day !== undefined ? all_day : true,
        location: location || null,
        color: color || null,
        reminder_days: reminder_days || [],
        created_by: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating calendar event:", error);
      return NextResponse.json(
        { error: "Failed to create calendar event" },
        { status: 500 },
      );
    }

    // Add attendees if provided
    if (attendees && Array.isArray(attendees) && attendees.length > 0) {
      const attendeesData = attendees.map((attendee: any) => ({
        event_id: event.id,
        user_id: attendee.user_id || null,
        email: attendee.email || null,
        name: attendee.name || null,
        status: "pending",
      }));

      const { error: attendeesError } = await supabase
        .from("event_attendees")
        .insert(attendeesData);

      if (attendeesError) {
        console.error("Error adding attendees:", attendeesError);
        // Continue anyway, the event was created successfully
      }
    }

    // Record in history
    await supabase.from("contract_history").insert({
      contract_id: params.contractId,
      user_id: user.id,
      action: "calendar_event_created",
      details: { event_id: event.id, title, event_type },
      ip_address: request.headers.get("x-forwarded-for") || request.ip,
    });

    return NextResponse.json({ event });
  } catch (err: any) {
    console.error("Unexpected error in calendar event create API:", err);
    return NextResponse.json(
      { error: err.message || "An unexpected error occurred" },
      { status: 500 },
    );
  }
}

// DELETE: Delete a calendar event
export async function DELETE(
  request: NextRequest,
  { params }: { params: { contractId: string } },
) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    // Get event ID from URL
    const url = new URL(request.url);
    const eventId = url.searchParams.get("eventId");

    if (!eventId) {
      return NextResponse.json(
        { error: "Event ID is required" },
        { status: 400 },
      );
    }

    // Check if event exists and belongs to this contract
    const { data: event, error: fetchError } = await supabase
      .from("calendar_events")
      .select("id, title")
      .eq("id", eventId)
      .eq("contract_id", params.contractId)
      .single();

    if (fetchError || !event) {
      console.error("Error fetching event:", fetchError);
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Delete event
    const { error } = await supabase
      .from("calendar_events")
      .delete()
      .eq("id", eventId);

    if (error) {
      console.error("Error deleting event:", error);
      return NextResponse.json(
        { error: "Failed to delete event" },
        { status: 500 },
      );
    }

    // Record in history
    await supabase.from("contract_history").insert({
      contract_id: params.contractId,
      user_id: user.id,
      action: "calendar_event_deleted",
      details: { event_id: eventId, title: event.title },
      ip_address: request.headers.get("x-forwarded-for") || request.ip,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Unexpected error in calendar event delete API:", err);
    return NextResponse.json(
      { error: err.message || "An unexpected error occurred" },
      { status: 500 },
    );
  }
}
