# CS 260 Notes

[My startup](https://simon.cs260.click)

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

For this deliverable, I am working on authenticating my users that login or create an account in sneakpeek360. Right now, I am having issues with my backend code with an internal server issue. This issue is specifically with the signUp.jsx file. Revise index.js and/or signUp.jsx files to see if they can fix those issues.

As for loginPage.jsx, I am also having internal server errors. Here is the specific error that arises when I try to login: loginService.js:10
POST http://localhost:5173/api/auth/login 500 (Internal Server Error)
loginUser @ loginService.js:10
handleSubmit @ loginPage.jsx:14

loginService.js:26 Login service error: SyntaxError: Unexpected end of JSON input
loginUser @ loginService.js:26
await in loginUser
handleSubmit @ loginPage.jsx:14
loginPage.jsx:18 Uncaught (in promise) ReferenceError: setError is not defined
at handleSubmit (loginPage.jsx:18:7)
handleSubmit @ loginPage.jsx:18

Could be because I don't have a current token assigned with my account? In other words, maybe it's because I haven't created an account yet? I doubt that but will need to dive deeper on what is going on. Check on why API (/api/auth/create) isn't registering correctly.
