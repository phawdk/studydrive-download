import { Store } from "vuex";
import { Post, StoreState } from "./sdtypes";

export async function forceLoadPostsAndComments(store: Store<StoreState>, onprogressmessage: (msg: string) => void) {
  // We hide the discussion as that is a very resource hungry thing when all comments are loaded.
  // Dear Studydrive devs, please Virtualize the discussion list.
  await store.commit("document/SET_SHOW_DISCUSSION", false);

  while (!store.state.document.discussionComplete) {
    onprogressmessage(`Loading Posts: ${store.state.document.discussionFeed.length}`);
    await store.dispatch("document/loadNextDiscussionPage");
    while (store.state.document.discussionLoading) {
      await new Promise((r) => setTimeout(r, 10));
    }
  }
  onprogressmessage("Making sure everything is there");
  let hasUnloaded = true;
  while (hasUnloaded) {
    hasUnloaded = false;

    const max = store.state.document.discussionFeed.length;
    for (let index = 0; index < max; index++) {
      const post = store.state.document.discussionFeed[index];
      if (post.totalComments > post.comments.length) {
        hasUnloaded = true;
        onprogressmessage(`Loading Comments ${index}/${max}`);
        await store.dispatch("document/loadPostComments", { postId: post.postDetails.id, context: "document" });
      }
    }
    await new Promise((r) => setTimeout(r, 10));
  }
}

export function sortCommentsByPage(data: Post[]) {
  const PageMarkings = new Map<number, Array<Post>>();

  for (const post of data) {
    const page = post.postDetails.markings?.page || 0; // Page 0 implies no real page, will later work perfectly with the title page.

    const arr = PageMarkings.get(page);
    if (arr) {
      arr.push(post);
    } else {
      PageMarkings.set(page, [post]);
    }
  }
  return PageMarkings;
}
