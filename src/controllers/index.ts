import type { Request, Response } from "express";
import {
  generateSVG,
  svgToJpg,
  uploadToCloudinary,
  generatePNSMetadata,
  uploadImageToIPFS,
  uploadNFTMetadata,
  mintNFT
} from "../services";
import { logger } from "../utils/log";
import { uiTest } from "../lib";

export async function getJpgController(req: Request, res: Response): Promise<void> {
  try {
    const { name } = req.query;
    if (!name || typeof name !== "string") {
      res.status(400).json({ error: "Name is required as a string" });
      return;
    }

    const svg = generateSVG(name as string);

    const jpgBuffer = await svgToJpg(svg);

    const imageUrl = await uploadToCloudinary(jpgBuffer, name as string);

    logger.success("Generated JPG:", imageUrl);

    res.json({
      name,
      imageUrl
    });
  } catch (error) {
    console.error("Error generating JPG:", error);
    res.status(500).json({
      error: "Failed to generate and upload image",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
}

export async function generateJpgController(req: Request, res: Response): Promise<void> {
  try {
    const { name } = req.query;
    if (!name || typeof name !== "string") {
      res.status(400).json({ error: "Name is required as a string" });
    }

    const svg = generateSVG(name as string);

    const jpgBuffer = await svgToJpg(svg);

    const imageUrl = await uploadToCloudinary(jpgBuffer, name as string);

    const metadata = generatePNSMetadata(
      name as string,
      `This is a dynamic identity for ${name}`,
      imageUrl
    );

    logger.success("Generated JPG:", imageUrl);

    res.json({
      name,
      imageUrl,
      metadata
    });
  } catch (error) {
    console.error("Error generating JPG:", error);
    res.status(500).json({
      error: "Failed to generate and upload image",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
}

export async function generatePNSController(req: Request, res: Response): Promise<void> {
  try {
    const { name = "unnamed" } = req.query;
    if (typeof name !== "string") {
      res.status(400).json({ error: "Name must be a string" });
    }

    const svg = generateSVG(name as string);
    const svgBuffer = Buffer.from(svg, "utf-8");

    const uploadedImage = await uploadImageToIPFS(svgBuffer, name as string);
    const image = `ipfs://${uploadedImage}`;

    const metadata = generatePNSMetadata(
      name as string,
      `This is a dynamic identity for ${name}`,
      image
    );

    logger.success("Generated metadata:", JSON.stringify(metadata));

    res.json(metadata);
  } catch (error) {
    console.error("Error generating metadata:", error);
    res.status(500).json({
      error: "Failed to generate metadata",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
}

export async function createPNSController(req: Request, res: Response): Promise<void> {
  try {
    const { name } = req.body;
    if (!name || typeof name !== "string") {
      res.status(400).json({ error: "Name is required as a string" });
    }

    const svg = generateSVG(name as string);
    const svgBuffer = Buffer.from(svg, "utf-8");

    const uploadedImage = await uploadImageToIPFS(svgBuffer, name as string);
    const image = `ipfs://${uploadedImage}`;

    const metadata = generatePNSMetadata(
      name as string,
      `This is a dynamic identity for ${name}`,
      image
    );

    const uploadResult = await uploadNFTMetadata(
      metadata.name,
      metadata.description,
      metadata.image
    );

    logger.success("Uploaded metadata to IPFS:", JSON.stringify(uploadResult, null, 2));

    res.json({
      metadataURI: `ipfs://${uploadResult.IpfsHash}`
    });
  } catch (error) {
    logger.error("Error creating PNS:", error);
    res.status(500).json({
      error: "Failed to create PNS",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
}

export async function generateImageController(req: Request, res: Response): Promise<void> {
  try {
    const { name } = req.query;
    if (!name || typeof name !== "string") {
      res.status(400).json({ error: "Name is required as a string" });
    }

    const svg = generateSVG(name as string);

    res.setHeader("Content-Type", "image/svg+xml");
    res.send(svg);
  } catch (error) {
    console.error("Error generating image:", error);
    res.status(500).json({
      error: "Failed to generate image",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
}

export function serveUITestController(req: Request, res: Response) {
  res.send(uiTest);
}