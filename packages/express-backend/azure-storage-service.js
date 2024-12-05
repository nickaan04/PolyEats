import { Readable } from "node:stream";
import { BlobServiceClient } from "@azure/storage-blob";
import { v4 as uuidv4 } from "uuid";

const STORAGE_ACCOUNT = process.env.AZURE_STORAGE_ACCOUNT_NAME || "your-storage-account-name";
const STORAGE_ACCESS_KEY = process.env.AZURE_STORAGE_ACCESS_KEY;
const STORAGE_CONTAINER = "images"; // Name of your Azure Blob Storage container

if (!STORAGE_ACCOUNT || !STORAGE_ACCESS_KEY) {
  throw new Error("Azure Storage Account credentials are not set in environment variables.");
}

// Create the Blob Service Client
const blobServiceClient = BlobServiceClient.fromConnectionString(
  `DefaultEndpointsProtocol=https;AccountName=${STORAGE_ACCOUNT};AccountKey=${STORAGE_ACCESS_KEY};EndpointSuffix=core.windows.net`
);

// Create a container client
const containerClient = blobServiceClient.getContainerClient(STORAGE_CONTAINER);

if (!containerClient.exists()) {
  console.warn(`Container "${STORAGE_CONTAINER}" does not exist. Ensure it is created in your Azure account.`);
}

/**
 * Upload a file to Azure Blob Storage.
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @returns {Promise<string>} The URL of the uploaded blob.
 */
export async function uploadBlob(req, res) {
  try {
    const filename = (req.query.filename as string) || "upload";
    const uuid = uuidv4();
    const blobname = `${uuid}:${filename}`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobname);
    const stream = Readable.from(req.body);

    await blockBlobClient.uploadStream(stream, undefined, undefined, {
      blobHTTPHeaders: { blobContentType: req.headers["content-type"] || "application/octet-stream" },
    });

    const url = blockBlobClient.url;
    return url; // Return the URL for saving in the database
  } catch (error) {
    console.error("Error uploading blob:", error);
    res.status(500).send({ message: "Failed to upload to Azure Blob Storage", error });
  }
}

/**
 * Download a file from Azure Blob Storage.
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 */
export async function downloadBlob(req, res) {
  try {
    const { blob } = req.params; // Blob name passed as a route parameter
    const blockBlobClient = containerClient.getBlockBlobClient(blob);

    const exists = await blockBlobClient.exists();
    if (!exists) {
      return res.status(404).send({ message: "Blob not found" });
    }

    const downloadBuffer = await blockBlobClient.downloadToBuffer();
    res.setHeader("Content-Type", "application/octet-stream");
    res.send(down
