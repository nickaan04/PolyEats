import { BlobServiceClient } from "@azure/storage-blob";

const AZURE_STORAGE_CONNECTION_STRING =
  process.env.AZURE_STORAGE_CONNECTION_STRING;

//initialize Blob Service Client
const blobServiceClient = BlobServiceClient.fromConnectionString(
  AZURE_STORAGE_CONNECTION_STRING
);

//upload file to Azure Storage
async function uploadFileToAzure(containerName, file, folderName = "") {
  const containerClient = blobServiceClient.getContainerClient(containerName);

  //create a full blob name with the folder (if provided)
  const blobName = folderName
    ? `${folderName}/${Date.now()}-${file.originalname}`
    : `${Date.now()}-${file.originalname}`;

  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  //upload the file using its buffer
  await blockBlobClient.upload(file.buffer, file.buffer.length);

  //return the public URL of the uploaded file
  return blockBlobClient.url;
}

//delete file from Azure Storage
async function deleteFileFromAzure(containerName, file, folderName = "") {
  //construct the full path within the container
  const blobPath = `${folderName}/${file}`;

  const containerClient = blobServiceClient.getContainerClient(containerName);
  const blockBlobClient = containerClient.getBlockBlobClient(blobPath);

  //delete the file
  const deleteResponse = await blockBlobClient.deleteIfExists();
  if (deleteResponse.succeeded) {
    console.log(`Successfully deleted blob: ${blobPath}`);
  } else {
    console.warn(`Blob not found or already deleted: ${blobPath}`);
  }
}

export { uploadFileToAzure, deleteFileFromAzure };
