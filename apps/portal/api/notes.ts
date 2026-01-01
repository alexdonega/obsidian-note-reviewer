/**
 * API para salvar e recuperar notas por slug
 * Vercel Serverless Function
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

// Simulação de banco de dados em memória (em produção, usar DB real)
const notes: Record<string, { title: string; content: string; createdAt: string }> = {};

export default function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
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
