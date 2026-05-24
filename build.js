import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function build() {
    if (fs.existsSync('./dist')) fs.rmSync('./dist', { recursive: true });
    fs.mkdirSync('./dist');

    const { data: posts, error } = await supabase.from('posts').select('*').order('created_at', { ascending: false });
    if (error) return console.error(error);

    const indexTemplate = fs.readFileSync('./index.html', 'utf-8');
    let postListHtml = '';

    posts.forEach(post => {
        postListHtml += `
            <div style="border-bottom:1px solid #eee; padding:20px 0;">
                <h3>${post.title}</h3>
                <img src="${post.image_url}" loading="lazy" style="max-width:100%;">
                <p>${post.content.substring(0, 100)}...</p>
                <a href="post_${post.id}.html">더 보기</a>
            </div>`;
    });

    fs.writeFileSync('./dist/index.html', indexTemplate.replace('<!-- POST_LIST_PLACEHOLDER -->', postListHtml));

    const postTemplate = fs.readFileSync('./post.html', 'utf-8');
    posts.forEach(post => {
        let finalPost = postTemplate
            .replace('<!-- POST_TITLE -->', post.title)
            .replace('<!-- POST_DATE -->', new Date(post.created_at).toLocaleDateString())
            .replace('<!-- POST_IMAGE -->', `<img src="${post.image_url}" style="max-width:100%;">`)
            .replace('<!-- POST_CONTENT -->', post.content.replace(/\n/g, '<br>'));
        fs.writeFileSync(`./dist/post_${post.id}.html`, finalPost);
    });
    console.log('빌드 완료!');
}
build();
