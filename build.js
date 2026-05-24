import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function build() {
    let { data: posts } = await supabase.from('posts').select('*').order('created_at', { ascending: false });
    if (!posts) posts = [];

    if (fs.existsSync('./dist')) fs.rmSync('./dist', { recursive: true });
    fs.mkdirSync('./dist');

    const indexTemplate = fs.readFileSync('./index.html', 'utf-8');
    let listHtml = '';
    posts.forEach(p => {
        listHtml += `<div style="border-bottom:1px solid #eee; padding:20px 0;"><h3>${p.title}</h3><img src="${p.image_url}" style="max-width:100%;"><p>${p.content}</p></div>`;
    });
    fs.writeFileSync('./dist/index.html', indexTemplate.replace('<!-- POST_LIST_PLACEHOLDER -->', listHtml));
    console.log('OK');
}
build();
