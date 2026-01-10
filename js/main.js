import { db } from './firebase-config.js';
import { collection, query, orderBy, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const blogGrid = document.querySelector('.blog-grid');
const searchInput = document.getElementById('search-input');

// Gear HTML to reuse
const gearHTML = `
    <div class="gear-container">
        <div class="gear gear-main"></div>
        <div class="gear gear-small"></div>
    </div>
`;

// Store blog data reference if needed, but filtering DOM nodes is sufficient for now
async function loadBlogs() {
    if (!blogGrid) return;

    try {
        const q = query(collection(db, "blogs"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);

        querySnapshot.forEach((doc) => {
            const data = doc.data();

            const card = document.createElement('div');
            card.className = 'blog-card has-gears';

            // 1. Image (Conditional)
            let imageHtml = "";
            if (data.imageUrl && data.imageUrl.startsWith('http')) {
                // Using template literal for simplicity and correct order handling
                imageHtml = `<img src="${escapeHtml(data.imageUrl)}" alt="Blog Image" class="blog-image" loading="lazy">`;
            }

            // 2. Title
            const titleHtml = `<h3 class="blog-title">${escapeHtml(data.title)}</h3>`;

            // 3. Description
            const excerptHtml = `<p class="blog-excerpt">${escapeHtml(data.description)}</p>`;

            // 4. Link (Conditional)
            let linkHtml = "";
            if (data.link && data.link.trim() !== "" && data.link !== "#") {
                linkHtml = `<a href="${escapeHtml(data.link)}" class="blog-meta" target="_blank">Read more</a>`;
            }

            // Assemble with innerHTML to ensure correct order: Gears -> Image -> Title -> Desc -> Link
            card.innerHTML = `${gearHTML}${imageHtml}${titleHtml}${excerptHtml}${linkHtml}`;

            // Prepend to show newest first
            blogGrid.insertBefore(card, blogGrid.firstChild);
        });

    } catch (error) {
        console.error("Error fetching blogs:", error);
    }
}

function escapeHtml(text) {
    if (!text) return "";
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Search Functionality
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const cards = document.querySelectorAll('.blog-card');

        cards.forEach(card => {
            const title = card.querySelector('.blog-title');
            if (title) {
                const titleText = title.textContent.toLowerCase();
                if (titleText.includes(searchTerm)) {
                    card.style.display = 'flex'; // Restore flex display
                } else {
                    card.style.display = 'none';
                }
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', loadBlogs);
