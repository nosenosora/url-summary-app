'use server';

import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import axios from 'axios';
import * as cheerio from 'cheerio';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function POST(req: NextRequest) {
  const { url } = await req.json();

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  let pageContent = '';
  try {
    const response = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
      }
    });
    const $ = cheerio.load(response.data);

    // Attempt to extract main content from common article/blog elements
    const mainContent = $('article, main, #main, .main-content, .entry-content').first().text();
    if (mainContent) {
      pageContent = mainContent;
    } else {
      // Fallback to body text if specific elements are not found
      pageContent = $('body').text();
    }

    // Basic cleanup: remove excessive whitespace and newlines
    pageContent = pageContent.replace(/\s\s+/g, ' ').trim();

    // Limit content length to avoid input token issues (approx 14000 characters)
    const MAX_CONTENT_LENGTH = 14000;
    if (pageContent.length > MAX_CONTENT_LENGTH) {
      pageContent = pageContent.substring(0, MAX_CONTENT_LENGTH);
    }

    if (pageContent.length === 0) {
      return NextResponse.json({ error: 'Could not extract content from the URL.' }, { status: 400 });
    }

  } catch (fetchError: any) {
    console.error('Error fetching or parsing URL:', fetchError);
    return NextResponse.json({ error: `Failed to fetch or parse URL content: ${fetchError.message}` }, { status: 500 });
  }

  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ error: 'Gemini API key not configured.' }, { status: 500 });
  }

  try {
    const { text } = await ai.models.generateContent({
      model: "gemini-1.5-pro-latest",
      contents: `以下の記事を1行で要約してください:\n${pageContent}`,
    });
    return NextResponse.json({ summary: text });
  } catch (geminiError: any) {
    console.error('Error calling Gemini API:', geminiError);
    return NextResponse.json({ error: `Failed to summarize content using Gemini API: ${geminiError.message}` }, { status: 500 });
  }
}