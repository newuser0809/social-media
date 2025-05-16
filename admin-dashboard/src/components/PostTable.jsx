import { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../contants/api";

function PostTable() {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 5;

  useEffect(() => {
    axios.get(`${API_URL}/posts/all`).then((res) => {
      setPosts(res.data);
      setFilteredPosts(res.data);
    });
  }, []);

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    setCurrentPage(1);
    const filtered = posts.filter(
      (p) =>
        p.text.toLowerCase().includes(query) ||
        p.user?.username?.toLowerCase().includes(query)
    );
    setFilteredPosts(filtered);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        await axios.delete(`${API_URL}/posts/${id}`);
        const updated = filteredPosts.filter((p) => p._id !== id);
        setPosts(posts.filter((p) => p._id !== id));
        setFilteredPosts(updated);
      } catch (error) {
        console.error("Failed to delete post:", error);
      }
    }
  };

  // Pagination logic
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Posts</h2>

      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search by text or username"
        value={searchQuery}
        onChange={handleSearch}
        className="border p-2 mb-4 w-full rounded"
      />

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300 text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 border-b">Text</th>
              <th className="px-4 py-2 border-b">User</th>
              <th className="px-4 py-2 border-b">Image</th>
              <th className="px-4 py-2 border-b">Likes</th>
              <th className="px-4 py-2 border-b">Comments</th>
              <th className="px-4 py-2 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentPosts.map((p) => (
              <tr key={p._id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-2 border-b">{p.text}</td>
                <td className="px-4 py-2 border-b">
                  {p.user?.username || "Unknown"}
                </td>
                <td className="px-4 py-2 border-b">
                  {p.img ? (
                    <a
                      href={p.img}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      View Image
                    </a>
                  ) : (
                    "No Image"
                  )}
                </td>
                <td className="px-4 py-2 border-b">{p.likes.length}</td>
                <td className="px-4 py-2 border-b">{p.comments.length}</td>
                <td className="px-4 py-2 border-b">
                  <button
                    onClick={() => handleDelete(p._id)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination Controls */}
        <div className="flex justify-center mt-4 space-x-2">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 rounded ${
                currentPage === i + 1
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-black"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PostTable;
