import puppeteer from "puppeteer";
import {sendMessage} from './gpts_requests.js'
import {openaiChat} from './gpts_requests.js'
import {createPost} from './create_post.js'
// import {createImg} from "./generate_img.js";

export const getPageTitle = async (page) => {
    return await page.evaluate(() => {
        return (
            document
                .querySelector(".container h1")
                .innerHTML.replace(/^\s+|\s+$/g, "")
        );
    });
};

export const getMeinInf = async (page) => {
    const meinInf = await page.evaluate(() => {
        const parentDiv = document.querySelector(".text-content .prose-sm").children;

        const postContent = [];

        for (let i = 0; i < parentDiv.length; i++) {
            const child = parentDiv[i];
            // postContent.push(`--------: ${parentDiv.length}`);
            let skipBlock = false;

            if (child.tagName && (child.tagName === "P" || child.tagName === "H2")) {
                // postContent.push(`------: ${child.children.length}`);
                for (let j = 0; j < child.children.length; j++) {
                    const spans = child.children[j];
                    for (let k = 0; k < spans.children.length; k++) {
                        // postContent.push(`----: ${spans.children.length}`);
                        const spanChild = spans.children[k];
                        if (spanChild.tagName === "IMG") {
                            // postContent.push(`--: ${spanChild.tagName}`);
                            skipBlock = true;
                            break;
                        }
                    }
                }
                // postContent.push(`-- ${skipBlock} --`);
                if (!skipBlock) {
                    postContent.push(`${child.textContent}`); // ${child.tagName}:
                }
            }
            // else if (child.tagName === "FIGURE") {
            //     postContent.push(
            //         `${child.children[0].children[0].tagName}: ${child.children[0].children[0].src}` // ${child.children[0].children[0].tagName}:
            //     );
            // }

        }

        return postContent.join("\n");
    });

    return meinInf;
};

export const getPagesNumber = async (page) => {
    return await page.evaluate(() => {
        const list = document.querySelector('.pagination-wrapper').querySelectorAll('li');
        return list.length;
    });
}

export const getPostFromPage = async (page) => {
    return await page.evaluate(() => {
        const allPost = Array.from(document.querySelectorAll('.blog-image a')).map(post => post.href);
        return allPost;
    });
}

export const getAllPostUrl = async () => {
    const allPost = []

    const browser = await puppeteer.launch({
        headless: false,
    });
    const page = await browser.newPage();
    await page.goto(
        "https://www.crepslocker.com/blogs/sneaker-news/"
    );

    const numberPages = await getPagesNumber(page);
    console.log(numberPages)
    await browser.close();

    for (let pageNum = 1; pageNum <= 1; pageNum++) {
        const browser = await puppeteer.launch({
            headless: false,
        });
        const page = await browser.newPage();

        await page.goto(
            `https://www.crepslocker.com/blogs/sneaker-news?page=${pageNum}`
        );

        const allPostFromPage = await getPostFromPage(page);
        const pattern = /([^/]+)\/?$/;
        allPostFromPage.map((postUrl) => {
            allPost.push(postUrl.match(pattern)[1])
        })

        await browser.close();
    }

    return allPost
}


export const  addNewPost = async (postDonorSlug) => {
    const browser = await puppeteer.launch({
        headless: true,
    });
    const page = await browser.newPage();
    await page.goto(
        `https://www.crepslocker.com/blogs/sneaker-news/${postDonorSlug}/`
    );

    // const language = "ukrainian";

    const title = await getPageTitle(page);
    const content = await getMeinInf(page);

    const answer = await sendMessage(title, content);
    // const imgId = await createImg(title)

    // let answer;
    // try {
    //     answer = await sendMessage(title, content, language);
    // } catch (error) {
    //     console.error("Помилка під час відправки повідомлення:", error);
    //     await browser.close();
    //     return;
    // }

    //await createPost(answer.title, answer.content, postDonorSlug, imgId);

    await browser.close();

    console.log('title' + title);
    console.log('content' + content);
    console.log('-----------------');
    console.log('answer ' + answer);
    return 1;
};



