import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const projectId = params.id;

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has access to this project
    const { data: projectAccess, error: accessError } = await supabase
      .from("project_members")
      .select("role")
      .eq("project_id", projectId)
      .eq("user_id", user.id)
      .single();

    if (accessError || !projectAccess) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Fetch files for the project
    const { data: files, error: filesError } = await supabase
      .from("files")
      .select(
        `
        id,
        filename,
        file_path,
        file_size,
        file_type,
        uploaded_by,
        uploaded_at,
        users!files_uploaded_by_fkey (
          id,
          display_name,
          email
        )
      `
      )
      .eq("project_id", projectId)
      .order("uploaded_at", { ascending: false });

    if (filesError) {
      console.error("Error fetching files:", filesError);
      return NextResponse.json(
        { error: "Failed to fetch files" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: files });
  } catch (error) {
    console.error("Files API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const projectId = params.id;

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has access to this project
    const { data: projectAccess, error: accessError } = await supabase
      .from("project_members")
      .select("role")
      .eq("project_id", projectId)
      .eq("user_id", user.id)
      .single();

    if (accessError || !projectAccess) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    const uploadedFiles = [];

    for (const file of files) {
      // Generate unique filename
      const timestamp = Date.now();
      const fileExtension = file.name.split(".").pop();
      const uniqueFilename = `${timestamp}_${file.name}`;
      const filePath = `projects/${projectId}/files/${uniqueFilename}`;

      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("project-files")
        .upload(filePath, file);

      if (uploadError) {
        console.error("File upload error:", uploadError);
        continue;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("project-files")
        .getPublicUrl(filePath);

      // Save file metadata to database
      const { data: fileRecord, error: dbError } = await supabase
        .from("files")
        .insert({
          project_id: projectId,
          filename: file.name,
          file_path: filePath,
          file_size: file.size,
          file_type: file.type,
          uploaded_by: user.id,
        })
        .select(
          `
          id,
          filename,
          file_path,
          file_size,
          file_type,
          uploaded_by,
          uploaded_at,
          users!files_uploaded_by_fkey (
            id,
            display_name,
            email
          )
        `
        )
        .single();

      if (dbError) {
        console.error("Database error:", dbError);
        // Clean up uploaded file if database insert fails
        await supabase.storage.from("project-files").remove([filePath]);
        continue;
      }

      uploadedFiles.push(fileRecord);
    }

    return NextResponse.json({
      data: uploadedFiles,
      message: `Successfully uploaded ${uploadedFiles.length} files`,
    });
  } catch (error) {
    console.error("File upload API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const projectId = params.id;
    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get("fileId");

    if (!fileId) {
      return NextResponse.json(
        { error: "File ID is required" },
        { status: 400 }
      );
    }

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has access to this project
    const { data: projectAccess, error: accessError } = await supabase
      .from("project_members")
      .select("role")
      .eq("project_id", projectId)
      .eq("user_id", user.id)
      .single();

    if (accessError || !projectAccess) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Get file details
    const { data: file, error: fileError } = await supabase
      .from("files")
      .select("*")
      .eq("id", fileId)
      .eq("project_id", projectId)
      .single();

    if (fileError || !file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Check if user can delete this file (admin, supervisor, or file owner)
    const canDelete =
      projectAccess.role === "admin" ||
      projectAccess.role === "supervisor" ||
      file.uploaded_by === user.id;

    if (!canDelete) {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    }

    // Delete file from storage
    const { error: storageError } = await supabase.storage
      .from("project-files")
      .remove([file.file_path]);

    if (storageError) {
      console.error("Storage deletion error:", storageError);
    }

    // Delete file record from database
    const { error: deleteError } = await supabase
      .from("files")
      .delete()
      .eq("id", fileId);

    if (deleteError) {
      console.error("Database deletion error:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete file" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "File deleted successfully",
    });
  } catch (error) {
    console.error("File deletion API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
