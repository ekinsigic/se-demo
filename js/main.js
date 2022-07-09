const mobile = window.getComputedStyle(document.querySelector('#measure')).display === 'none';

let articles = [];
let lightbox = {
    open: false,
    moving: false
};

// element selection function. Will make it much easier to manage the code later.
function sqElementSelect(elementSelector) {
    const thisNodeList = document.querySelectorAll(elementSelector);
    if (thisNodeList.length < 1) {
        return false;
    } else if (thisNodeList.length > 1) {
        const elementsArray = [];
        thisNodeList.forEach(element => {
            elementsArray.push(element);
        });
        return elementsArray;
    } else {
        return thisNodeList[0];
    }
}

function fetchArticles(sourceUrl) {
    fetch( sourceUrl, {
        method: 'GET'
    }).then(response => response.json()).then((newArticles) => {
        articles = newArticles;
        updateArticles(articles);
    });
}

function updateArticles(articleArray) {
    const $articlesList = sqElementSelect('.articlesList');
    $articlesList.innerHTML = '';
    articleArray.forEach((thisArticle, i) => {
        const thisArticleHTML =
            `
                  <a class="singleArticle incoming" id="article-${thisArticle.id}" href="#article-${thisArticle.id}" data-id="${thisArticle.id}">
                    <img class="articleImage" src="${thisArticle.artwork}" alt="lorem ipsum">
                    <h3 class="articleTitle">${thisArticle.title}</h3>
                    <p class="articleExcerpt">${thisArticle.content}</p>
                  </a>
            `
        $articlesList.innerHTML += thisArticleHTML;
        setTimeout(()=>{
            sqElementSelect('#article-'+thisArticle.id).classList.remove("incoming");
        }, 400+(100*i));
    })

    initiateInteractions();
}

function initiateInteractions() {
    sqElementSelect('a[href^="#article"]').forEach($thisArticleButton => {
        $thisArticleButton.addEventListener('click', e => {
            e.preventDefault();
            const thisArticleID = $thisArticleButton.getAttribute('href').split('-')[1];
            goToArticleInLightbox(thisArticleID);
        });
    });

    articleCardImageAnimation();
}

window.addEventListener('keyup', (e)=>{
    if (!lightbox.moving && lightbox.open && e.key === 'Escape') {
        closeLightbox();
    }
    if (!lightbox.moving && lightbox.open && e.key === 'ArrowRight') {
        adjacentArticleLightbox('next');
    }
    if (!lightbox.moving && lightbox.open && e.key === 'ArrowLeft') {
        adjacentArticleLightbox('prev');
    }
});

function goToArticleInLightbox(articleID) {
    if (!lightbox.open) {
        openLightbox(articleID);
    } else {

    }
}

function adjacentArticleLightbox(direction) {
    if (direction === 'prev' && lightbox.index > 0) {
        changeLightboxArticle(articles[lightbox.index-1].id);
    } else if (direction === 'next' && lightbox.index < (articles.length-1)) {
        changeLightboxArticle(articles[lightbox.index+1].id);
    }
}

function getLightboxArticle(articleID) {
    const thisArticleIndex = articles.findIndex(article => article.id.toString() === articleID.toString());
    lightbox.index = thisArticleIndex;
    return articles[thisArticleIndex];
}

function changeLightboxArticle(newArticleID) {
    lightbox.moving = true;

    const direction = lightbox.index > articles.findIndex(article => article.id.toString() === newArticleID.toString()) ? 'backward' : 'forward';
    const nextLightboxArticle = getLightboxArticle(newArticleID);

    const newArticleHTML =
        `
          <div class="lightboxArticleCard ${direction}Arriving">
            <img class="articleImage lightboxArticleImage" src="${nextLightboxArticle.artwork}" alt="lorem ipsum">
            <h3 class="articleTitle lightboxArticleTitle">${nextLightboxArticle.title}</h3>
            <p class="articleExcerpt lightboxArticleExcerpt">${nextLightboxArticle.content}</p>
          </div>
        `
    sqElementSelect('.lightboxArticleCard').classList.add(direction+'Leaving');
    sqElementSelect('.lightboxInnerWrapper').insertAdjacentHTML('beforeend', newArticleHTML);

    setTimeout(()=>{
        sqElementSelect('.'+direction+'Leaving').remove();
        sqElementSelect('.'+direction+'Arriving').classList.remove(direction+'Arriving');
        setTimeout(()=>{
            lightbox.moving = false;
        },200);
    },200);
}

function openLightbox(articleID) {
    lightbox.open = true;
    lightbox.moving = true;

    const thisLightboxArticle = getLightboxArticle(articleID);

    const lightboxHTML =
    `
    <div id="lightbox" class="away">
        <div class="lightboxInnerWrapper">
          <div class="lightboxArticleCard">
            <img class="articleImage lightboxArticleImage" src="${thisLightboxArticle.artwork}" alt="lorem ipsum">
            <h3 class="articleTitle lightboxArticleTitle">${thisLightboxArticle.title}</h3>
            <p class="articleExcerpt lightboxArticleExcerpt">${thisLightboxArticle.content}</p>
          </div>
        </div>
        <div class="lightboxButton prevButton">
          <span class="material-icons-round">arrow_back_ios</span>
        </div>
        <div class="lightboxButton nextButton">
          <span class="material-icons-round">arrow_forward_ios</span>
        </div>
        <div class="lightboxButton closeButton">
          <span class="material-icons-round">close</span>
        </div>
    </div>
    `
    sqElementSelect('body').insertAdjacentHTML('beforeend', lightboxHTML);
    lightbox.el = sqElementSelect('#lightbox');

    setTimeout(()=>{
        lightbox.el.classList.remove('away');
        setTimeout(()=>{
            lightbox.moving = false;
        },500)
    },500);

    sqElementSelect('.lightboxButton.prevButton').addEventListener('click', ()=>{
        if (!lightbox.moving) {
            adjacentArticleLightbox('prev');
        }
    });
    sqElementSelect('.lightboxButton.nextButton').addEventListener('click', ()=>{
        if (!lightbox.moving) {
            adjacentArticleLightbox('next');
        }
    });
    sqElementSelect('.lightboxButton.closeButton').addEventListener('click', ()=>{
        if (!lightbox.moving) {
            closeLightbox();
        }
    });
}

function closeLightbox() {
    lightbox.el.classList.add('away');
    setTimeout(()=>{
        lightbox.el.remove();
        lightbox.el = null;
        lightbox.open = false;
    },500);
}

fetchArticles('https://gist.githubusercontent.com/ekinsigic/9c48a3f88deacd88f85fa71f4dbff82b/raw/aabdcc89edfe099ce4d441573bf02a1349d7653d/de-demo.json');


// This is an interaction I'm copying directly from another website I made, woden.co
// It took me more than a day to nail this down, so please don't take this part into
// account as a part I developed within the timeframe of this project.
// I'm only adding it here for gimmickry
let windowDimensions = {
    width: window.innerWidth,
    height: window.innerHeight
};
let cursorPosition = {
    x: 0,
    y: 0
};

window.addEventListener('resize', ()=>{
    windowDimensions = getNewWindowDimensions();
});
window.addEventListener('mousemove', e=>{
    cursorPosition = trackCursorPosition(e);
});

function trackCursorPosition(e) {
    return {
        x: e.clientX,
        y: e.clientY
    }
}

function getNewWindowDimensions() {
    return {
        width : window.innerWidth,
        height : window.innerHeight
    }
}

function articleCardImageAnimation() {
    if (!mobile) {
        const articleCards = document.querySelectorAll('.singleArticle:nth-child(n+3)');

        const newArticleCards = [];
        articleCards.forEach(articleCard => {
            newArticleCards.push(new CreateArticleCard(articleCard));
        });

        window.addEventListener('mousemove', ()=>{
            newArticleCards.forEach(card => {
                if (card.visible) {
                    renderCard(card);
                }
            });
        });

        window.addEventListener('scroll', ()=>{
            newArticleCards.forEach(card => {
                if (card.visible) {
                    renderCard(card);
                }
            });
        });

        function renderCard(thisCard) {
            const distances = {
                x: (thisCard.coordinates.x - cursorPosition.x) / windowDimensions.width,
                y: (thisCard.coordinates.y - cursorPosition.y) / windowDimensions.height
            };
            thisCard.image.style.transform = 'rotateY('+(distances.x * -10)+'deg) rotateX('+(distances.y * 10)+'deg)';
            thisCard.image.style.boxShadow = (distances.x * 20)+'px '+(distances.y * 20)+'px 40px rgba(23,30,40,0.4)';
        }

        function CreateArticleCard(articleCard) {
            this.clientTop = articleCard.getBoundingClientRect().top;
            this.clientLeft = articleCard.getBoundingClientRect().left;
            this.image = articleCard.querySelector('img');
            this.imageWidth = this.image.offsetWidth;
            this.imageHeight = this.image.offsetHeight;
            this.visible = !(-this.clientTop > (this.imageHeight + 40)) && (this.clientTop+40 < windowDimensions.height);
            this.coordinates = {
                x: this.clientLeft + (this.imageWidth/2),
                y: this.clientTop + (this.imageHeight/2)
            };

            window.addEventListener('resize', ()=>{
                this.clientTop = articleCard.getBoundingClientRect().top;
                this.clientLeft = articleCard.getBoundingClientRect().left;
                this.imageWidth = this.image.offsetWidth;
                this.imageHeight = this.image.offsetHeight;
                this.coordinates = {
                    x: this.clientLeft + (this.imageWidth/2),
                    y: this.clientTop + (this.imageHeight/2)
                };
                this.visible = !(-this.clientTop > (this.imageHeight + 40)) && (this.clientTop+40 < windowDimensions.height);
            });

            document.addEventListener('scroll', ()=>{
                this.clientTop = articleCard.getBoundingClientRect().top;
                this.clientLeft = articleCard.getBoundingClientRect().left;
                this.coordinates = {
                    x: this.clientLeft + (this.imageWidth/2),
                    y: this.clientTop + (this.imageHeight/2)
                };
                this.visible = !(-this.clientTop > (this.imageHeight + 40)) && (this.clientTop < windowDimensions.height + 40);
            });
        };
    }
}
// This is an interaction I'm copying directly from another website I made, woden.co
// It took me more than a day to nail this down, so please don't take this part into
// account as a part I developed within the timeframe of this project.
// I'm only adding it here for gimmickry