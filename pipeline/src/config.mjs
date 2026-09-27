import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

export const PIPELINE_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const ROOT_DIR = path.resolve(PIPELINE_DIR, '..');
export const BLOG_DIR = path.join(ROOT_DIR, 'site', 'src', 'content', 'blog');
export const MANIFEST = path.join(PIPELINE_DIR, '.last-run.json');

dotenv.config({ path: path.join(PIPELINE_DIR, '.env'), quiet: true });

function required(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing ${name} in pipeline/.env (copy .env.example → .env and fill it).`);
  return v;
}

export const config = {
  keyFile: path.resolve(PIPELINE_DIR, process.env.GOOGLE_KEY_FILE || '../.secrets/service-account.json'),
  sheetId: () => required('CONTENT_PLAN_SHEET_ID'),
  sheetTab: process.env.CONTENT_PLAN_TAB || 'Content Plan',
  checklistSheetId: process.env.CHECKLIST_SHEET_ID,
  draftsFolderId: () => required('DRAFTS_FOLDER_ID'),
  assetsFolderId: () => required('ASSETS_FOLDER_ID'),
  siteUrl: (process.env.SITE_URL || 'https://example.com').replace(/\/$/, ''),
};

// Content Plan sheet: column headers are matched by prefix, so "(auto)" / hints in the header are fine.
export const COLS = {
  postId: 'Post ID',
  status: 'Status',
  category: 'Category',
  title: 'Title',
  author: 'Author',
  eventDate: 'Event date',
  publishDate: 'Publish date',
  excerpt: 'Excerpt',
  cover: 'Cover image',
  tags: 'Tags',
  consent: 'Photo consent',
  liveUrl: 'Live URL',
  lastPublished: 'Last published',
  notes: 'Notes',
};

export const STATUS = {
  ready: 'Ready to publish',
  update: 'Needs update',
  published: 'Published',
};

export const CATEGORY_KEYS = {
  'hope kids': 'hope-kids',
  ablaze: 'ablaze',
  'young pro': 'young-pro',
  community: 'community',
};

export const ID_PREFIX = { 'hope-kids': 'HK', ablaze: 'AB', 'young-pro': 'YP', community: 'CM' };
