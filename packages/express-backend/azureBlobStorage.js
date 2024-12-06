import { BlobServiceClient } from "@azure/storage-blob";

const AZURE_STORAGE_CONNECTION_STRING =
  process.env.AZURE_STORAGE_CONNECTION_STRING;

// Initialize Blob Service Client
const blobServiceClient = BlobServiceClient.fromConnectionString(
  AZURE_STORAGE_CONNECTION_STRING
);

async function uploadFileToAzure(containerName, file) {
  const containerClient = blobServiceClient.getContainerClient(containerName);
  const blobName = `${Date.now()}-${file.originalname}`;
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  // Upload the file
  await blockBlobClient.upload(file.buffer, file.buffer.length);

  // Get the public URL
  return blockBlobClient.url;
}

async function deleteFileFromAzure(containerName, blobName) {
  const containerClient = blobServiceClient.getContainerClient(containerName);
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  // Delete the file
  await blockBlobClient.deleteIfExists();
}

export { uploadFileToAzure, deleteFileFromAzure };
