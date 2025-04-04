import { createClient } from "../../../../../supabase/server";
import { redirect } from "next/navigation";
import DashboardHeader from "@/components/dashboard-header";
import DashboardSidebar from "@/components/dashboard-sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Save, Plus, Trash2, Tag } from "lucide-react";
import { updateContractTemplateAction } from "@/app/actions";
import FormMessage from "@/components/form-message";

export default async function EditContractTemplatePage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Fetch template data
  const { data: template, error } = await supabase
    .from("contract_templates")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error || !template) {
    return redirect("/contracts?error=Template not found");
  }

  return (
    <>
      <DashboardHeader />
      <DashboardSidebar />
      <main className="p-4 sm:ml-64 pt-20">
        <div className="p-4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold">Edit Contract Template</h1>
            <Button
              variant="outline"
              onClick={() => window.history.back()}
              className="flex items-center gap-2"
            >
              Back to Templates
            </Button>
          </div>

          {/* Display success/error messages */}
          {searchParams.success && (
            <FormMessage
              type="success"
              message={searchParams.success as string}
              className="mb-6"
            />
          )}
          {searchParams.error && (
            <FormMessage
              type="error"
              message={searchParams.error as string}
              className="mb-6"
            />
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Template Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <form
                    action={updateContractTemplateAction}
                    method="post"
                    encType="multipart/form-data"
                    className="space-y-6"
                  >
                    <input type="hidden" name="templateId" value={params.id} />
                    <input
                      type="hidden"
                      name="current_file_path"
                      value={template.file_path}
                    />
                    <input
                      type="hidden"
                      name="current_file_url"
                      value={template.file_url}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name">Template Name</Label>
                        <Input
                          id="name"
                          name="name"
                          defaultValue={template.name}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Input
                          id="category"
                          name="category"
                          defaultValue={template.category}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        name="description"
                        defaultValue={template.description || ""}
                        rows={3}
                      />
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
                        <FileText className="h-8 w-8 text-blue-500" />
                        <div>
                          <h3 className="font-medium">Current Template File</h3>
                          <p className="text-sm text-gray-500">
                            {template.file_path.split("/").pop()}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="ml-auto"
                          onClick={() =>
                            window.open(template.file_url, "_blank")
                          }
                        >
                          View File
                        </Button>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="file">Upload New File (Optional)</Label>
                        <Input
                          id="file"
                          name="file"
                          type="file"
                          accept=".pdf,.docx"
                        />
                        <p className="text-xs text-gray-500">
                          Leave empty to keep the current file. Upload a new
                          file to replace it.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Tag className="h-4 w-4" />
                        <span>Dynamic Fields</span>
                      </Label>
                      <p className="text-sm text-gray-500 mb-2">
                        Define the dynamic fields that will be replaced in your
                        template. Use the format {"{{field_name}}"} in your
                        document.
                      </p>
                      <div className="space-y-4" id="dynamic-fields">
                        {template.dynamic_fields &&
                        template.dynamic_fields.length > 0 ? (
                          template.dynamic_fields.map(
                            (field: any, index: number) => (
                              <div
                                key={index}
                                className="flex items-center gap-2"
                              >
                                <Input
                                  name={`field_names[${index}]`}
                                  defaultValue={field.name}
                                  placeholder="Field name (e.g. client_name)"
                                  className="flex-1"
                                />
                                <Input
                                  name={`field_labels[${index}]`}
                                  defaultValue={field.label}
                                  placeholder="Display label (e.g. Client Name)"
                                  className="flex-1"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="flex-shrink-0"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ),
                          )
                        ) : (
                          <div className="flex items-center gap-2">
                            <Input
                              name="field_names[0]"
                              placeholder="Field name (e.g. client_name)"
                              className="flex-1"
                            />
                            <Input
                              name="field_labels[0]"
                              placeholder="Display label (e.g. Client Name)"
                              className="flex-1"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="flex-shrink-0"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-2 flex items-center gap-2"
                        onClick={() => {
                          const container =
                            document.getElementById("dynamic-fields");
                          const fieldCount = container?.children.length || 0;
                          const newField = document.createElement("div");
                          newField.className = "flex items-center gap-2";
                          newField.innerHTML = `
                            <input name="field_names[${fieldCount}]" placeholder="Field name (e.g. client_name)" class="flex-1 h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
                            <input name="field_labels[${fieldCount}]" placeholder="Display label (e.g. Client Name)" class="flex-1 h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
                            <button type="button" class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring h-9 w-9 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground flex-shrink-0">
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" x2="10" y1="11" y2="17"></line><line x1="14" x2="14" y1="11" y2="17"></line></svg>
                            </button>
                          `;
                          container?.appendChild(newField);
                        }}
                      >
                        <Plus className="h-4 w-4" />
                        <span>Add Field</span>
                      </Button>
                    </div>

                    <div className="flex justify-end gap-3">
                      <Button
                        variant="outline"
                        type="button"
                        onClick={() => window.history.back()}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
                      >
                        <Save className="h-4 w-4" />
                        <span>Save Changes</span>
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Template Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-[3/4] bg-gray-100 rounded-lg flex items-center justify-center">
                    <iframe
                      src={template.file_url}
                      className="w-full h-full rounded-lg"
                      title="Contract Template Preview"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
