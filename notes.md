# CS 260 Notes

[My startup](https://sneakpeek360.com)

## Helpful links

- [Course instruction](https://github.com/webprogramming260)
- [Canvas](https://byu.instructure.com)
- [MDN](https://developer.mozilla.org)

## AWS Notes

I have bought a DNS name called sneakpeek360.com using Amazon's Route 53 element. I also have an EC2 instance that I am currently renting to deploy the web app on a server in North Virginia. I linked the public ip address to my domain name and was able to get it certified.

## HTML Notes

For this deliverable, I created a web app using the figma layout that I had made prior to this part of the deliverable. I created six simple webpages for a user to navigate through as they login and create their own sneakpeek360 account. I added a little bit of CSS to make it look more appealing. Still looks a little static but I have a good view of where I want to head from here. I will add more html elements as I progress throughout this project, but for now we will stick with this.

## CSS Notes

For this deliverable, I added an embedded youtube video on the homepage screen to make the web page stand out more. I also added an all black background with white text, making it easy for the user to read. I also reformatted my forms to make them look more user friendly and appealling to the eye. I also added a verification page where the user can input digits individually when they receive a confirmation email. Lastly, I split the landing page into 3 columns so the user can see everything they need to see at all times.

## React Notes

For this deliverable, I had to download react and inject it into my current project. The initial set-up wasn't too challenging, especially since the directions walk us through it pretty easily. However, it took a while for the layout that I want to be created. It was a little challenging splitting up certain parts of my view pages into columns, so I created another separate view called latestDrops. From there, users can easily navigate to a page where the latest drops of sneakers will update.

## React 2 Notes

For this deliverable, I really wanted to focus on displaying the user's username on my landing page when they log in or create a username. I was able to do so implementing the useState and useEffect methods from React. I had to assign the username variable into the parent file (app.jsx), then create a function inside of username.jsx and pass the returned value into landingPage.jsx. I also did the same thing for loginPage.jsx. Next steps will be to verify if the user has an account and send them a verification email when I get there, but I will need to have my database handle that information.

## Services Notes

THIRD PARTY ENDPOINT IS WRITTEN IN src/latestDrops/latestDrops.jsx

For this deliverable, I am working on authenticating my users that login or create an account in sneakpeek360.
I have figured out the internal server errors. It is because I was not running my index.js file while running my startup project in dev. I have opened a separate terminal and for everytime I want to dev my project, I run the index.js file as well to ensure my data is being passed correctly as I test my project. A user can now sign up for an account in my project and log out if they want to. Right now, I am having trouble figuring out how to get a returning user to log in. Here is the error that I am getting thrown back from the browser's console:

ADDED https://kickscrew-sneakers-data.p.rapidapi.com/search?query=yeezy%2C%20nike%2C%20new%20balance%2C%20puma%2C%20hoka%2C%20on%2C%20ugg AS BASE API URL

Also, for my backend to remember logged out user information, i will need to attach a database for that functionality. looks like we will cover that topic later.

# DB Notes

A returning user can finally create an account, logout, and log back in! I am super excited about that progress. What I was missing is that in the loginPage.jsx file, I was saving the user's password as "Password" with a capital p. Since the variable that is getting passed is case sensitive, I had to change the variable's name to a lower-case p. Now that I have figured that error out, a user can log back in. Super stoked!

With the API, I need to figure out how to get the images to display. I will try to work through it so that I can get images to pop up along with their release dates. If not, look for other APIs.

LOOK FOR NEW API!! CURRENT ONE NOT AS RELIABLE AS I WOULD LIKE TO BE.

UPLOAD PHOTO WORKS! FOCUS ON API NOW!!

For Later: add a button where once a user logs in they can add photos on the web app. Also add css to the logout button. If time permits, create an account webpage where a user can view and edit their profile information.

# WebSocket Notes

I am currently adding functionality so that when a user posts their pictures, websocket can take it and display them on landingPage.jsx. May take some time, but I am currently configuring index.js, uploadHandler.js, and landingPage.jsx. I have made changes in the vite.config.js and package.json files to accept WebSocket, and have downloaded packages from npm into my project so I have access to it.

Check out this recent error:

uploadPhoto.jsx:35 Upload failed:
AxiosError {message: 'Request failed with status code 500', name: 'AxiosError', code: 'ERR_BAD_RESPONSE', config: {…}, request: XMLHttpRequest, …}
code
:
"ERR_BAD_RESPONSE"
config
:
{transitional: {…}, adapter: Array(3), transformRequest: Array(1), transformResponse: Array(1), timeout: 0, …}
message
:
"Request failed with status code 500"
name
:
"AxiosError"
request
:
XMLHttpRequest {onreadystatechange: null, readyState: 4, timeout: 0, withCredentials: false, upload: XMLHttpRequestUpload, …}
response
:
{data: {…}, status: 500, statusText: 'Internal Server Error', headers: AxiosHeaders, config: {…}, …}
status
:
500
stack
:
"AxiosError: Request failed with status code 500\n at settle (http://localhost:5173/node_modules/.vite/deps/axios.js?v=04074853:1218:12)\n at XMLHttpRequest.onloadend (http://localhost:5173/node_modules/.vite/deps/axios.js?v=04074853:1550:7)\n at Axios.request (http://localhost:5173/node_modules/.vite/deps/axios.js?v=04074853:2108:41)\n at async handleSubmit (http://localhost:5173/src/uploadPhoto/uploadPhoto.jsx:21:24)"
[[Prototype]]
:
Error

uploadPhoto.jsx:27
POST http://localhost:5173/api/upload 500 (Internal Server Error)
uploadPhoto.jsx:35 Upload failed:
AxiosError {message: 'Request failed with status code 500', name: 'AxiosError', code: 'ERR_BAD_RESPONSE', config: {…}, request: XMLHttpRequest, …}
handleSubmit @ uploadPhoto.jsx:35

Check out axios error. we defined it in landingPage.jsx and could be causing errors. image seemed to be uploading in s3 storage cloud just fine. Maybe login to s3 to see if there are images there.

# Feature Work Notes (after the deliverables)

Summary of everything added after the course deliverables. The full write-up (API list, architecture, setup) is in the "Project update" section of README.md.

## Features added

- **Profile pages** at /profile/:username with a photo grid, profile picture, and photo / follower / following counts. Usernames in the feed link to them, and there are links in the top nav and the phone tab bar. Profile pictures can be changed from your own profile page. HEIC and SVG uploads are not supported (JPEG, PNG, GIF, WebP up to 5 MB, checked by file contents).
- **Likes** with live counts over WebSocket.
- **User search** at /search: case-insensitive, usernames that start with the search come first.
- **Follow system** with a follows collection. Private accounts need to approve follow requests, can decline them, and can remove existing followers. The feed now shows only your own posts plus people you follow. Privacy is enforced on the server (locked profiles send no posts, likes and comments on private posts return 404, live new-post messages only go to the author and accepted followers).
- **Comments**: "View Comments" now expands inline with an add box, count, and delete (own comments, or any comment on your own post).
- **Sign up flow**: one form instead of two steps, so the password is only typed once. Server-side validation added.
- **Required MFA**: every user sets up an authenticator app (QR code) and gets 8 one-time recovery codes. Login is password then 6-digit code. Codes can't be reused, wrong codes are limited, and secrets are encrypted in the database with a key in dbConfig.json (MFA_ENCRYPTION_KEY).
- **Upload page** redesigned with a drag-and-drop zone, preview, and a description counter.

## CSS changes

- **Theme**: replaced the textured background with a flat near-black theme and a single red accent. All colors are CSS variables in :root (--bg, --surface, --surface-2, --border, --text, --muted, --accent, --accent-hover, --accent-text), so the palette can be changed in one place.
- **Buttons**: one consistent red button style for every plain button, plus a .button-secondary variant (dark with a border) for Cancel, Following, Requested, Remove and Private toggles.
- **Nav**: header tiles aligned to the center, Logout styled like the other tiles, active link outlined in red. The right-hand sidebar on the feed page was removed.
- **Feed**: post cards capped at 640px wide with a 560px image height, rounded cards with a soft shadow, like button and like count row.
- **Mobile (768px breakpoint)**: smaller nav tiles, 44px minimum touch targets, 16px inputs (stops iOS zooming into a field), the home video scales instead of staying 600x400, and an Instagram-style bottom tab bar (Feed, Drops, Search, Upload, Profile) fixed to the bottom with safe-area padding, replacing the top links on phones.
- **Auth pages** (sign up, login, MFA): shared card layout, logo capped at 240px wide (it was a fixed 900x500), dark inputs with a red focus ring, pill toggles instead of bare checkboxes for shoe brands, a light date-picker icon on the dark background, inline red error text.
- **Profile**: one centered column, avatar and stats stacked in the middle, photo grid in flexbox (three per row) so a short last row is centered too, a back arrow, and a "Private" badge.
- **Upload**: dashed drop zone that turns red on hover or focus, image preview, spaced Cancel / Upload buttons.
- **Comments, search, requests**: small card and list styles that reuse the same variables.

## Lessons learned

- The backend (node index.js) does not reload when its files change. Several "the button is missing" or "it didn't work" reports were really a backend that was still running old code. Restart it after server changes. The Vite frontend reloads by itself.
- A try/catch that rethrows a new generic error hides the real one. The old login service turned every failure into "Network error", which made wrong-password errors look like server problems.
- Hiding something in the UI is not privacy. Anything that must be private has to be enforced on the server, including the live WebSocket messages and endpoints reached by id.
- Pushing to GitHub does not change the live site. Run deployService.sh to release. It also copies service/*.json (including dbConfig.json), so a new key added locally travels with the deploy.
- The Latest Drops page still calls http://localhost:4001, so it only works on my own computer. Plan: store upcoming drops in my own database (an upcomingDrops collection) and show them as a calendar.
