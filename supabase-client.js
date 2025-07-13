// supabase-client.js
const SUPABASE_URL = 'https://ozshtpdeeqmwliqixuqr.supabase.co'; // ← pon aquí tu URL
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96c2h0cGRlZXFtd2xpcWl4dXFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0MzYxMzcsImV4cCI6MjA2ODAxMjEzN30.IcKE_aF6dIFxSBJxpKrgjznf_V65zdZPKBfayq1c36w'; // ← pon aquí tu clave pública

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
