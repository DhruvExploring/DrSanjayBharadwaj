import { auth, db } from './firebase-config.js';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { collection, addDoc, getDocs, doc, deleteDoc, updateDoc, serverTimestamp, query, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const loginForm = document.getElementById('login-form');
const blogForm = document.getElementById('blog-form');
const loginSection = document.getElementById('login-section');
const dashboardSection = document.getElementById('dashboard-section');
const logoutBtn = document.getElementById('logout-btn');
const messageDiv = document.getElementById('message');
const blogListContainer = document.getElementById('blog-list');
const submitBtn = document.getElementById('submit-btn');
const cancelEditBtn = document.getElementById('cancel-edit-btn');

let isEditing = false;
let editingDocId = null;

// Helper to show messages
function showMessage(msg, type = 'success') {
    messageDiv.textContent = msg;
    messageDiv.className = type;
    messageDiv.style.display = 'block';
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 5000);
}

// Auth State Observer
onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is signed in
        loginSection.classList.add('hidden');
        dashboardSection.classList.remove('hidden');
        loadBlogs(); // Load blogs when logged in
    } else {
        // User is signed out
        loginSection.classList.remove('hidden');
        dashboardSection.classList.add('hidden');
    }
});

// Login Handler
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        await signInWithEmailAndPassword(auth, email, password);
        // UI updates automatically via onAuthStateChanged
    } catch (error) {
        showMessage('Login failed: ' + error.message, 'error');
    }
});

// Logout Handler
logoutBtn.addEventListener('click', async () => {
    try {
        await signOut(auth);
    } catch (error) {
        showMessage('Logout error: ' + error.message, 'error');
    }
});

// Load Blogs Function
async function loadBlogs() {
    blogListContainer.innerHTML = '<p style="text-align: center; color: var(--medium-gray);">Loading blogs...</p>';

    try {
        const q = query(collection(db, "blogs"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);

        blogListContainer.innerHTML = ''; // Clear loading text

        if (querySnapshot.empty) {
            blogListContainer.innerHTML = '<p style="text-align: center;">No blogs found.</p>';
            return;
        }

        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const id = docSnap.id;

            const item = document.createElement('div');
            item.className = 'blog-list-item';

            // Create inner HTML safely
            item.innerHTML = `
                <div class="blog-info">
                    <h4>${escapeHtml(data.title)}</h4>
                    <p>${escapeHtml(data.description)}</p>
                </div>
                <div class="blog-actions">
                    <button class="btn btn-sm btn-edit" data-id="${id}">Edit</button>
                    <button class="btn btn-sm btn-delete" data-id="${id}">Delete</button>
                </div>
            `;

            // Add Event Listeners avoiding closures in loop issues
            item.querySelector('.btn-edit').addEventListener('click', () => startEdit(id, data));
            item.querySelector('.btn-delete').addEventListener('click', () => deleteBlog(id));

            blogListContainer.appendChild(item);
        });

    } catch (error) {
        console.error("Error loading blogs:", error);
        blogListContainer.innerHTML = '<p style="text-align: center; color: red;">Error loading blogs.</p>';
    }
}

// Helper to prevent XSS
function escapeHtml(text) {
    if (!text) return "";
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Start Edit Mode
function startEdit(id, data) {
    isEditing = true;
    editingDocId = id;

    document.getElementById('title').value = data.title;
    document.getElementById('description').value = data.description;
    document.getElementById('link').value = data.link || "";
    document.getElementById('imageUrl').value = data.imageUrl || ""; // NEW

    submitBtn.textContent = "Update Post";
    cancelEditBtn.classList.remove('hidden');

    // Scroll to form
    document.querySelector('.container').scrollIntoView({ behavior: 'smooth' });
}

// Cancel Edit Mode
cancelEditBtn.addEventListener('click', () => {
    resetForm();
});

function resetForm() {
    isEditing = false;
    editingDocId = null;
    blogForm.reset();
    submitBtn.textContent = "Publish Update";
    cancelEditBtn.classList.add('hidden');
}

// Delete Blog
async function deleteBlog(id) {
    if (confirm("Are you sure you want to delete this post? This cannot be undone.")) {
        try {
            await deleteDoc(doc(db, "blogs", id));
            showMessage("Blog post deleted.");
            loadBlogs(); // Refresh list
        } catch (error) {
            showMessage("Error deleting: " + error.message, "error");
        }
    }
}

// Blog Post/Update Handler
blogForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const link = document.getElementById('link').value;
    const imageUrl = document.getElementById('imageUrl').value; // NEW

    try {
        submitBtn.disabled = true;
        submitBtn.textContent = isEditing ? 'Updating...' : 'Publishing...';

        // Data object
        const postData = {
            title: title,
            description: description,
            link: link || "", // Empty string if no link
            imageUrl: imageUrl || "", // Empty string if no image
        };

        if (isEditing && editingDocId) {
            // Update existing
            const blogRef = doc(db, "blogs", editingDocId);
            await updateDoc(blogRef, postData);
            showMessage('Blog post updated successfully!');
        } else {
            // Create new
            postData.createdAt = serverTimestamp();
            await addDoc(collection(db, "blogs"), postData);
            showMessage('New blog post created!');
        }

        resetForm();
        loadBlogs(); // Refresh list

    } catch (error) {
        showMessage('Error: ' + error.message, 'error');
    } finally {
        submitBtn.disabled = false;
        if (!isEditing) submitBtn.textContent = 'Publish Update';
        else submitBtn.textContent = 'Update Post';
    }
});
