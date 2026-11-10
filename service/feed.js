// Shapes a post document for the browser.
// The raw `likes` array (a list of user ids) is never sent out; the browser only
// gets the count, plus whether the viewer is one of the likers.
const toFeedPost = (post, profilePicUrl, viewerId) => {
  const { likes = [], ...rest } = post;
  return {
    ...rest,
    _id: String(post._id),
    profilePicUrl: profilePicUrl || null,
    likeCount: likes.length,
    likedByMe: viewerId ? likes.includes(viewerId) : false,
  };
};

module.exports = { toFeedPost };
