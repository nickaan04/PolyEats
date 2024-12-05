import { Readable } from "node:stream";
import { BlobServiceClient } from "@azure/storage-blob";
import { v4 as uuidv4 } from "uuid";

const STORAGE_ACCOUNT =
  process.env.AZURE_STORAGE_ACCOUNT_NAME || "polyeats1901";
const STORAGE_ACCESS_KEY = process.env.AZURE_STORAGE_ACCESS_KEY;
const STORAGE_CONTAINER = "images"; // Name of your Azure Blob Storage container

if (!STORAGE_ACCOUNT || !STORAGE_ACCESS_KEY) {
  throw new Error(
    "Azure Storage Account credentials are not set in environment variables."
  );
}

// Create the Blob Service Client
const blobServiceClient = BlobServiceClient.fromConnectionString(
  `DefaultEndpointsProtocol=https;AccountName=${STORAGE_ACCOUNT};AccountKey=${STORAGE_ACCESS_KEY};EndpointSuffix=core.windows.net`
);

// Create a container client
const containerClient = blobServiceClient.getContainerClient(STORAGE_CONTAINER);

if (!containerClient.exists()) {
  console.warn(
    `Container "${STORAGE_CONTAINER}" does not exist. Ensure it is created in your Azure account.`
  );
}

/**
 * Upload a file to Azure Blob Storage.
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @returns {Promise<string>} The URL of the uploaded blob.
 */
export function uploadBlob(req, res) {
  const filename = String(req.query.filename || "upload"); // Ensure it's a string
  const uuid = uuidv4();
  const blobname = `${uuid}:${filename}`;
  const blockBlobClient = containerClient.getBlockBlobClient(blobname);
  const stream = Readable.from(req.body);

  blockBlobClient
    .uploadStream(stream)
    .then((blobResponse) => {
      res.status(201).send({
        url: `/images/${blobname}`,
        md5: blobResponse.contentMD5
      });
    })
    .catch((error) => {
      console.log("Blob upload error:", error);
      res.status(500).send({
        message: "Failed to upload to blob storage",
        error
      });
    });
}

/**
 * Download a file from Azure Blob Storage.
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 */
export function downloadBlob(req, res) {
  const { blob } = req.params; // Blob name passed as a route parameter
  const blockBlobClient = containerClient.getBlockBlobClient(blob);

  blockBlobClient
    .exists()
    .then((exists) => {
      if (!exists) {
        return res.status(404).send({ error: "Blob not found" });
      }

      // Stream the blob content directly to the response
      blockBlobClient
        .download(0)
        .then((downloadResponse) => {
          res.setHeader("Content-Type", downloadResponse.contentType);
          res.setHeader(
            "Content-Disposition",
            `attachment; filename="${blob}"`
          );
          downloadResponse.readableStreamBody.pipe(res);
        })
        .catch((error) => {
          console.error("Error during blob download:", error);
          res.status(500).send({ error: "Failed to download blob" });
        });
    })
    .catch((error) => {
      console.error("Blob existence check failed:", error);
      res.status(500).send({ error: "Failed to download blob" });
    });
}
