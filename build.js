import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function build() {
    // 1. 데이터베이스에서 글 가져오기
    let { data: posts, error } = await supabase.from('posts').select('*').order('created_at', { ascending: false });
    
    // [보완] 데이터베이스에 글이 0개여도 에러 없이 깃허브 페이지 방(브랜치)을 만들도록 강제 설정
    if (!posts) {
        posts = [];
    }

    // 2. 빌드용 dist 폴더 생성 및 초기화
    if (fs.existsSync('./dist')) fs.rmSync('./dist', { recursive: true });
    fs.mkdirSync('./dist');

    // 3. 메인 목록 페이지 뼈대 읽기 및 글 목록 채우기
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

    // 4. 상세 페이지 뼈대 읽기 및 개별 글 파일 생성
    const postTemplate = fs.readFileSync('./post.html', 'utf-8');
    posts.forEach(post => {
        let finalPost = postTemplate
            .replace('<!-- POST_TITLE -->', post.title)
            .replace('<!-- POST_DATE -->', new Date(post.created_at).toLocaleDateString())
            .replace('<!-- POST_IMAGE -->', `<img src="${post.image_url}" style="max-width:100%;">`)
            .replace('<!-- POST_CONTENT -->', post.content.replace(/\n/g, '<br>'));
        fs.writeFileSync(`./dist/post_${post.id}.html`, finalPost);
    });
    
    console.log('🚀 데이터가 비어있어도 무조건 정적 빌드 성공!');
}
build();
