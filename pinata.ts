import * as dotenv from "dotenv";
import axios from "axios";
import FormData from "form-data";

dotenv.config();

const key: string | undefined = process.env.PINATA_KEY;
const secret: string | undefined = process.env.PINATA_SECRET;

if (!key || !secret) {
  throw new Error("Pinata API key or secret is missing. Please check your .env file.");
}

interface IPFSResponse {
  success: boolean; 
  pinataURL?: string;
  message?: string;
}

export const uploadJSONToIPFS = async (JSONBody: Record<string, any>): Promise<IPFSResponse> => {
  const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;

  try {
    const response = await axios.post(url, JSONBody, {
      headers: {
        pinata_api_key: key,
        pinata_secret_api_key: secret,
      },
    });

    return {
      success: true,
      pinataURL: `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`,
    };
  } catch (error: any) {
    console.error("Error uploading JSON to IPFS:", error.message);
    return {
      success: false,
      message: error.message,
    };
  }
};

export const uploadFileToIPFS = async (file: Buffer | Blob): Promise<IPFSResponse> => {
  const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;
  
  const data = new FormData();
  data.append("file", file);

  const metadata = JSON.stringify({
    name: "testname",
    keyvalues: {
      exampleKey: "exampleValue",
    },
  });
  data.append("pinataMetadata", metadata);

  const pinataOptions = JSON.stringify({
    cidVersion: 0,
    customPinPolicy: {
      regions: [
        {
          id: "FRA1",
          desiredReplicationCount: 1,
        },
        {
          id: "NYC1",
          desiredReplicationCount: 2,
        },
      ],
    },
  });
  data.append("pinataOptions", pinataOptions);

  try {
    const response = await axios.post(url, data, {
      maxBodyLength: Infinity,
      headers: {
        "Content-Type": `multipart/form-data; boundary=${(data as any)._boundary}`,
        pinata_api_key: key,
        pinata_secret_api_key: secret,
      },
    });

    console.log("Image uploaded:", response.data.IpfsHash);
    return {
      success: true,
      pinataURL: `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`,
    };
  } catch (error: any) {
    console.error("Error uploading file to IPFS:", error.message);
    return {
      success: false,
      message: error.message,
    };
  }
};
