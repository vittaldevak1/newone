const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

function getHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

async function request(endpoint, options = {}) {
  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: { ...getHeaders(), ...options.headers },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}

// ================= TRIPS =================
export const tripApi = {
  create: (tripData) =>
    request("/api/trips", { method: "POST", body: JSON.stringify(tripData) }),

  getUserTrips: () => request("/api/trips/user/trips"),

  getOne: (tripId) => request(`/api/trips/${tripId}`),

  update: (tripId, tripData) =>
    request(`/api/trips/${tripId}`, { method: "PUT", body: JSON.stringify(tripData) }),

  delete: (tripId) => request(`/api/trips/${tripId}`, { method: "DELETE" }),
};

// ================= MATCHES =================
export const matchApi = {
  getMy: () => request("/api/matches/my"),

  getConnections: () => request("/api/matches/connections"),

  discover: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/api/matches/discover?${query}`);
  },

  connect: (targetUserId) =>
    request("/api/matches/connect", {
      method: "POST",
      body: JSON.stringify({ targetUserId }),
    }),

  accept: (matchId) =>
    request(`/api/matches/${matchId}/accept`, { method: "PUT" }),

  decline: (matchId) =>
    request(`/api/matches/${matchId}/decline`, { method: "PUT" }),

  cleanup: () =>
    request("/api/matches/cleanup", { method: "DELETE" }),
};

// ================= MESSAGES =================
export const messageApi = {
  send: (matchId, content) =>
    request("/api/messages", {
      method: "POST",
      body: JSON.stringify({ matchId, content }),
    }),

  getForMatch: (matchId) => request(`/api/messages/${matchId}`),

  getUnreadCount: () => request("/api/messages/unread/count"),

  sendTyping: (matchId) =>
    request("/api/messages/typing", {
      method: "POST",
      body: JSON.stringify({ matchId }),
    }),

  getTyping: (matchId, userId) => request(`/api/messages/typing/${matchId}/${userId}`),

  // Self-chat
  getSelfMessages: () => request("/api/messages/self/messages"),
  sendSelf: (content) =>
    request("/api/messages/self/send", {
      method: "POST",
      body: JSON.stringify({ content }),
    }),
};

// ================= REVIEWS =================
export const reviewApi = {
  create: (revieweeId, tripId, rating, comment) =>
    request("/api/reviews", {
      method: "POST",
      body: JSON.stringify({ revieweeId, tripId, rating, comment }),
    }),

  getUserReviews: (userId) => request(`/api/reviews/user/${userId}`),

  delete: (reviewId) => request(`/api/reviews/${reviewId}`, { method: "DELETE" }),
};

// ================= AUTH =================
export const authApi = {
  getProfile: () => request("/api/auth/profile"),

  updateProfile: (profileData) =>
    request("/api/auth/profile", {
      method: "PUT",
      body: JSON.stringify(profileData),
    }),

  blockUser: (userId) =>
    request("/api/auth/block", {
      method: "POST",
      body: JSON.stringify({ userId }),
    }),

  unblockUser: (userId) =>
    request("/api/auth/unblock", {
      method: "POST",
      body: JSON.stringify({ userId }),
    }),

  getBlocked: () => request("/api/auth/blocked"),
};
