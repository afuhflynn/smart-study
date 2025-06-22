"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import {
  Upload,
  FileText,
  Image,
  X,
  CheckCircle,
  Sparkles,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface FileUploadProps {
  onClose: () => void;
}

interface UploadedFile {
  file: File;
  progress: number;
  status: "uploading" | "processing" | "completed" | "error";
  id: string;
  documentId?: string;
}

export function FileUpload({ onClose }: FileUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map((file) => ({
      file,
      progress: 0,
      status: "uploading" as const,
      id: Math.random().toString(36).substr(2, 9),
    }));

    setUploadedFiles((prev) => [...prev, ...newFiles]);

    // Simulate upload and processing
    newFiles.forEach((uploadedFile) => {
      simulateUpload(uploadedFile.id, uploadedFile.file);
    });

    toast.success(`${acceptedFiles.length} file(s) added for processing`);
  }, []);

  const simulateUpload = (fileId: string, file: File) => {
    const updateProgress = (
      progress: number,
      status?: UploadedFile["status"]
    ) => {
      setUploadedFiles((prev) =>
        prev.map((file) =>
          file.id === fileId
            ? { ...file, progress, ...(status && { status }) }
            : file
        )
      );
    };

    // Simulate upload progress
    let uploadProgress = 0;
    const uploadInterval = setInterval(() => {
      uploadProgress += Math.random() * 15;
      if (uploadProgress >= 100) {
        uploadProgress = 100;
        clearInterval(uploadInterval);
        updateProgress(100, "processing");

        // Actually process the file
        setTimeout(() => processFile(file, fileId, updateProgress), 500);
      } else {
        updateProgress(uploadProgress);
      }
    }, 200);
  };

  const processFile = async (
    file: File,
    fileId: string,
    updateProgress: (progress: number, status?: UploadedFile["status"]) => void
  ) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      // Determine file type
      let type = "text";
      if (file.type.includes("image/")) {
        type = "image";
      } else if (file.type.includes("pdf")) {
        type = "pdf";
      }
      formData.append("type", type);

      const response = await fetch("/api/extract", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to process file");
      }

      const result = await response.json();

      if (result.success) {
        updateProgress(100, "completed");
        toast.success(`${file.name} processed successfully!`);

        // Update the file with the actual document ID from the server
        setUploadedFiles((prev) =>
          prev.map((f) =>
            f.id === fileId ? { ...f, documentId: result.documentId } : f
          )
        );
      } else {
        throw new Error(result.error || "Processing failed");
      }
    } catch (error) {
      console.error("File processing error:", error);
      updateProgress(0, "error");
      toast.error(
        `Failed to process ${file.name}: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles((prev) => prev.filter((file) => file.id !== fileId));
    toast.info("File removed");
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "text/plain": [".txt"],
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".bmp", ".webp"],
    },
    maxFiles: 5,
    maxSize: 50 * 1024 * 1024, // 50MB
    onDropRejected: (fileRejections) => {
      fileRejections.forEach((file) => {
        const errors = file.errors.map((e) => e.message).join(", ");
        toast.error(`${file.file.name}: ${errors}`);
      });
    },
  });

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase();
    if (
      ["png", "jpg", "jpeg", "gif", "bmp", "webp"].includes(extension || "")
    ) {
      return <Image className="h-5 w-5" />;
    }
    return <FileText className="h-5 w-5" />;
  };

  const getStatusColor = (status: UploadedFile["status"]) => {
    switch (status) {
      case "uploading":
        return "text-blue-600";
      case "processing":
        return "text-purple-600";
      case "completed":
        return "text-green-600";
      case "error":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getStatusText = (status: UploadedFile["status"]) => {
    switch (status) {
      case "uploading":
        return "Uploading...";
      case "processing":
        return "Processing with AI...";
      case "completed":
        return "Ready to read!";
      case "error":
        return "Upload failed";
      default:
        return "";
    }
  };

  const getStatusIcon = (status: UploadedFile["status"]) => {
    switch (status) {
      case "uploading":
        return <Upload className="h-4 w-4 animate-bounce" />;
      case "processing":
        return <Sparkles className="h-4 w-4 animate-spin" />;
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      case "error":
        return <X className="h-4 w-4" />;
      default:
        return <Zap className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card
          className={`border-2 border-dashed transition-all duration-300 ${
            isDragActive
              ? "border-purple-400 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 scale-105"
              : "border-gray-300 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-600"
          }`}
        >
          <CardContent className="p-8">
            <motion.div
              {...getRootProps()}
              className="cursor-pointer text-center"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <input {...getInputProps()} />

              <motion.div
                className="mb-6"
                animate={isDragActive ? { scale: [1, 1.1, 1] } : {}}
                transition={{
                  duration: 0.5,
                  repeat: isDragActive ? Infinity : 0,
                }}
              >
                <div
                  className={`mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${
                    isDragActive
                      ? "bg-gradient-to-br from-purple-500 to-blue-500 text-white"
                      : "bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 text-gray-400"
                  }`}
                >
                  <Upload className="h-8 w-8" />
                </div>
              </motion.div>

              <motion.h3
                className="mb-2 text-lg font-medium text-gray-900 dark:text-white"
                animate={isDragActive ? { scale: [1, 1.05, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                {isDragActive ? "Drop files here..." : "Upload your documents"}
              </motion.h3>

              <p className="mb-6 text-sm text-gray-600 dark:text-gray-300">
                Drag and drop your PDF, text files, or images here, or click to
                browse
              </p>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  type="button"
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Choose Files
                </Button>
              </motion.div>

              <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                Supports PDF, TXT, PNG, JPG, JPEG, GIF, BMP, WEBP (up to 50MB
                each)
              </p>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Uploaded Files */}
      <AnimatePresence>
        {uploadedFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-3"
          >
            <h4 className="font-medium text-gray-900 dark:text-white flex items-center">
              <Sparkles className="mr-2 h-4 w-4 text-purple-600" />
              Processing Files ({uploadedFiles.length})
            </h4>

            {uploadedFiles.map((uploadedFile, index) => (
              <motion.div
                key={uploadedFile.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                layout
              >
                <Card className="border border-gray-200 dark:border-gray-700 hover-glow transition-all duration-300">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <motion.div
                        className="flex-shrink-0"
                        whileHover={{ scale: 1.1 }}
                      >
                        {getFileIcon(uploadedFile.file.name)}
                      </motion.div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {uploadedFile.file.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {(uploadedFile.file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div
                          className={`flex items-center space-x-2 text-sm ${getStatusColor(
                            uploadedFile.status
                          )}`}
                        >
                          {getStatusIcon(uploadedFile.status)}
                          <span>{getStatusText(uploadedFile.status)}</span>
                        </div>

                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(uploadedFile.id)}
                            className="hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </motion.div>
                      </div>
                    </div>

                    {uploadedFile.status !== "completed" &&
                      uploadedFile.status !== "error" && (
                        <motion.div
                          className="mt-3"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.2 }}
                        >
                          <Progress
                            value={uploadedFile.progress}
                            className="h-2"
                          />
                          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                            <span>
                              {Math.round(uploadedFile.progress)}% complete
                            </span>
                            <span>
                              {uploadedFile.status === "uploading"
                                ? "Uploading..."
                                : "Processing..."}
                            </span>
                          </div>
                        </motion.div>
                      )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actions */}
      <motion.div
        className="flex justify-end space-x-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </motion.div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            disabled={
              uploadedFiles.filter((f) => f.status === "completed").length === 0
            }
            onClick={() => {
              const completedDocs = uploadedFiles.filter(
                (f) => f.status === "completed"
              );
              if (completedDocs.length > 0) {
                const docWithId = completedDocs.find((f) => f.documentId);
                if (docWithId) {
                  window.location.href = `/reader/${docWithId.documentId}`;
                } else {
                  // Fallback to first completed doc with original ID
                  window.location.href = `/reader/${completedDocs[0].id}`;
                }
                toast.success(
                  `${completedDocs.length} document(s) ready to read!`
                );
              }
              onClose();
            }}
            className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white disabled:opacity-50"
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Continue Reading (
            {uploadedFiles.filter((f) => f.status === "completed").length})
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
