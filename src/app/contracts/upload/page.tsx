import DashboardHeader from "@/components/dashboard-header";
import DashboardSidebar from "@/components/dashboard-sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileUpload, Upload, Tag, Save, Plus, Trash2 } from "lucide-react";
import { redirect } from "next/navigation";
import { createClient } from "../../../../supabase/server";

export default async function UploadContractPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  return (
    <>
      <DashboardHeader />
      <DashboardSidebar />
      <main className="p-4 sm:ml-64 pt-20">
        <div className="p-4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold">Upload Contract Template</h1>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Template Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                action="/api/upload-contract"
                method="post"
                encType="multipart/form-data"
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Template Name</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="Ex: Service Agreement Template"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      name="category"
                      placeholder="Ex: Service Agreement"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Describe the purpose of this contract template..."
                    rows={3}
                  />
                </div>

                <div className="p-6 border border-dashed rounded-lg bg-gray-50 flex flex-col items-center justify-center">
                  <FileUpload className="h-12 w-12 text-gray-400 mb-2" />
                  <h3 className="text-lg font-medium">
                    Drag and drop your template file here
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Supports PDF or DOCX (max. 10MB)
                  </p>
                  <Input
                    id="file"
                    name="file"
                    type="file"
                    accept=".pdf,.docx"
                    required
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="flex items-center gap-2"
                    onClick={() => document.getElementById("file")?.click()}
                  >
                    <Upload className="h-4 w-4" />
                    <span>Select File</span>
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    <span>Dynamic Fields</span>
                  </Label>
                  <p className="text-sm text-gray-500 mb-2">
                    Define the dynamic fields that will be replaced in your
                    template. Use the format {"{field_name}"} in your document.
                  </p>
                  <div className="space-y-4" id="dynamic-fields">
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
                    <span>Upload Template</span>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
