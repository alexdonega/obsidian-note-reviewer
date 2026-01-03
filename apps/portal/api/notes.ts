/**
 * API para salvar e recuperar notas por slug
 * Vercel Serverless Function
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { setCorsHeaders, handlePreflightRequest } from '../utils/cors';

// Simulação de banco de dados em memória (em produção, usar DB real)
const notes: Record<string, { title: string; content: string; createdAt: string }> = {};

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Get the Origin header from the request for CORS validation
  const origin = req.headers.origin;

  // Set secure CORS headers based on origin validation
  setCorsHeaders(res, origin);

  // Handle CORS preflight request
  if (handlePreflightRequest(req.method, res)) {
    return;
  }

  const { slug } = req.query;

  // GET /api/notes?slug=titulo-da-nota
  if (req.method === 'GET' && slug) {
    const note = notes[slug as string];
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }
    return res.status(200).json(note);
  }

  // POST /api/notes - Save new note
  if (req.method === 'POST') {
    const { slug: noteSlug, title, content } = req.body;

    if (!noteSlug || !title || !content) {
      return res.status(400).json({ error: 'Missing required fields: slug, title, content' });
    }

    notes[noteSlug] = {
      title,
      content,
      createdAt: new Date().toISOString()
    };

    return res.status(201).json({
      success: true,
      slug: noteSlug,
      url: `https://r.alexdonega.com.br/${noteSlug}`
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
