"use server";

import { utapi } from "@/app/api/uploadthing/core";
import { env } from "@/env";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { UTFile } from "uploadthing/server";

// Using OpenRouter for image generation via OpenAI compatible API
const openrouterImageUrl = "https://openrouter.ai/api/v1";
const openrouterApiKey = env.OPENROUTER_API_KEY;

export type ImageModelList =
  | "black-forest-labs/FLUX1.1-pro"
  | "black-forest-labs/FLUX.1-schnell"
  | "black-forest-labs/FLUX.1-schnell-Free"
  | "google/imagen-3-fast" // OpenRouter free image models
  | "black-forest-labs/flux-schnell-free";

export async function generateImageAction(
  prompt: string,
  model: ImageModelList = "google/imagen-3-fast",
) {
  // Get the current session
  const session = await auth();

  // Check if user is authenticated
  if (!session?.user?.id) {
    throw new Error("You must be logged in to generate images");
  }

  try {
    console.log(`Generating image with OpenRouter model: ${model}`);

    // Generate the image using OpenRouter (OpenAI compatible API)
    const response = await fetch(`${openrouterImageUrl}/images/generations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openrouterApiKey}`,
        "HTTP-Referer": "https://github.com/thecoachmanuel/PresentMax",
        "X-Title": "PresentMax",
      },
      body: JSON.stringify({
        model: model,
        prompt: prompt,
        size: "1024x768",
        n: 1,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenRouter image generation error:", errorText);
      throw new Error(`OpenRouter image generation failed: ${response.statusText}`);
    }

    const result = (await response.json()) as {
      data: { url: string }[];
    };

    const imageUrl = result.data[0]?.url;

    if (!imageUrl) {
      throw new Error("No image URL returned from OpenRouter");
    }

    console.log(`Generated image URL: ${imageUrl}`);

    // Download the image from OpenRouter URL
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error("Failed to download image from OpenRouter");
    }

    const imageBlob = await imageResponse.blob();
    const imageBuffer = await imageBlob.arrayBuffer();

    // Generate a filename based on the prompt
    const filename = `${prompt.substring(0, 20).replace(/[^a-z0-9]/gi, "_")}_${Date.now()}.png`;

    // Create a UTFile from the downloaded image
    const utFile = new UTFile([new Uint8Array(imageBuffer)], filename);

    // Upload to UploadThing
    const uploadResult = await utapi.uploadFiles([utFile]);

    if (!uploadResult[0]?.data?.ufsUrl) {
      console.error("Upload error:", uploadResult[0]?.error);
      throw new Error("Failed to upload image to UploadThing");
    }

    console.log(uploadResult);
    const permanentUrl = uploadResult[0].data.ufsUrl;
    console.log(`Uploaded to UploadThing URL: ${permanentUrl}`);

    // Store in database with the permanent URL
    const generatedImage = await db.generatedImage.create({
      data: {
        url: permanentUrl, // Store the UploadThing URL instead of the Together AI URL
        prompt: prompt,
        userId: session.user.id,
      },
    });

    return {
      success: true,
      image: generatedImage,
    };
  } catch (error) {
    console.error("Error generating image:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to generate image",
    };
  }
}
