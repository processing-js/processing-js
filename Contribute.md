# How to contribute to Processing.js

If you want to contribute to Processing.js in any form, that's great! This document explains the fundamental philosophy behind Processing.js, what kind of contributions are welcome, and how to interact with each other on the issue tracker and on IRC

## The fundamental rule for Processing.js

The fundamental rule for Processing.js is: **Processing.js should allow Processing code to run on the web**.

Any contributions to Processing.js are evaluated in terms of getting the library as close to "parity" with Processing as possible.

Parity means that if it works in Processing, it should work in Processing.js too, *provided the limitations of JavaScript, compared to java, allow for that*.

However, very importantly "parity" does **not** mean that Processing.js's code needs to do exactly the same thing for code that does *not* work in Processing, so code that causes errors to be thrown in Processing might actually "do something" in Processing.js, just not the right thing at all.

Processing.js is not a "general purpose graphics library" like other JavaScript libraries, it is specifically meant to make Processing source code run on the web, and so if you run across bugs because you're using Processing.js as a pure JS library, then please first make sure that the code you wrote works in regular Processing. If it doesn't, then you'll first have to rewrite your code to work there, before concluding there is a bug in Processing.js

## How can I contribute?    

There are a few categories of contribution that help improve Processing.js:

### Writing code fixes

This is the big one: if parts of Processing.js do the wrong thing, compared to Processing, or there are functions missing from Processing.js that are in the Processing API, or they exist but they don't support all the different ways that function can behave, then fixing that is the primary way to contribute to Processing.js

Fork the repository to your account, clone your copy, fix up the code you want to fix up (in a branch dedicated to that one thing you're fixing), and then if you also want to contribute that fix back to Processing.js:

- find the issue that is associated with the problem you solved
- if there is no issue, file one!
- write, or extend, one or more test cases for the code that you fixed. The test should fail without your fixes, but pass with your fixes.
- file a pull request for your branch with the fix against the "processing-js" account (not jeresig, which github will probably pick for you)

After that, people can comment on your pull request to improve it so that it will neatly fit in with the rest of the code base.

### Writing or improving tests

Even if you don't know how to write JavaScript all that well, if you run into some code that you know works in Processing, but does not work in Processing.js, having a test with that code is super useful!

- reduce your code to ideally fewer than 10 lines of code that still reproduces the bad behaviour you see
- find a test for the part of the code in Processing.js that breaks for your 
- add your code to that test and submit a pull request for it!

### Writing or improving documentation

Keeping documentation up to date is one of the hardest problems in open source software. If you want to help improve the documentation: hurray!

- code documentation is in the form of comments in the source code
- reference and website documentation can be found over on the processing-js.github.io repository, and PRs are always welcome!

### Finding bugs and writing issues for others

Even if you don't want to write code at all, you can write a bug with some code that works in Processing but does not work in Processing.js, with a description of what it should do, what Processing does, and what you see Processing.js do instead. You probably found something that no one else has found yet, so reporting it will help people track down the problem even if they've never run across it themselves.

### Help debug problems to uncover

If you do like coding, but you don't want to write patches and go through the process of getting those landed, you can still help out by investigating what might be wrong, and simply reporting your findings in the issue associated with the problem. Things like "This seems to be caused by the caching mechanism used in the Parser.js module, in the StringAST parse function" are valuable information for others to know: it helps save a ton of time just knowing where to start looking.

## How do I interact with others?

Open source is a collaborative efforts, so try to interact with others in an open and friendly way. Pointing out things are wrong is fine, but be polite about it: there is a normal, real human being on the other side of the table, and they have feelings, too. Don't just say what is wrong, but explain why you think so, so that people can learn from that and can have a discussion to get to the root of what is wrong.

### Remember: you are not your code

It is hard to not feel attacked personally when someone points out a problem with the code you wrote, but remember that you are not your code. We all make mistakes, have typos, forget about a particular pattern that "would have been much better to use" etc. etc. so when someone points out mistakes in your code, as long as they're polite about it they're helping you get better, not telling you that you are bad at writing code.

### Have a normal conversation

It is tempting to just list comments and critique, such as a bullet list of things that wrong, or points you agree/disagree with, but you're not talking to machines, so please don't do this. Use normal language to describe what you're thinking of and what you'd recommend be done in normal paragraphs of text. If you have multiple points to make, just write multiple paragraphs. They can be short, but unless someone asked a question and you're supplying the answer and that answer is short, don't just list factoids.

### If someone tells you they feel uncomfortable with things you do, listen

It's easy to think that the way you communicate is fine, and that when someone says they are uncomfortable with it, then that's their problem. That is, however, not acceptable in this project. Respect other contributors, and behave in a way that does not make them feel uncomfortable. If someone points out that the way you communicate is curt and even rude, ask them what they mean and how they think you could improve your communication. Don't tell them off for being too sensitive, and also don't just go "ok" and then try to figure out how to fix it on your own: ask people to help you improve when they point out there is room for improvement. This is true for code, but it's just as true for behaviour. 

### And if someone makes you feel uncomfortable, tell them

The reserve of the previous point is also true: if someone is behaving in a way that makes you uncomfortable, tell them that. And then also tell them why that is and what you think they can do to overcome that. Don't wait for them to acknowledge you before telling them how you would like to be treated instead. Working in a group is not just about getting good code, tests, and documentation written, but also about making sure that everyone in the group can work together without animosity or resentment. You can always walk out on a project whenever you want, so it's worth first trying to address problems before giving up on someone. You might be surprised how much they listen. 

### Don't "derail" conversations with side issues

Each issue is for, not surprisingly, one issue. If while discussing an issue you find a new bug, file a new issue for it so that you can have two conversations, each about its own dedicated topic.

If you are discussion an issue and you find yourself talking about things that are only tangentially related to that issue, again: please file a new issue instead, or if the tangent isn't all that important, simply stop talking about it can get the issue back on track.

While having discussions is natural, open source development is not about having discussions, it's about having discussions that lead to actions that can be taken to improve the open source project. If you want to have a discussion that you think needs to be had: **file an issue for it**. Filing an issue like "discuss what parity means" or "should Processing.js be more informative if it's given broken code" is a perfectly legitimate course of action, and then a meaningful, on-topc discussion can be had there.    

#### "derailing" comments may be deleted, and fully derailed issues may get closed

In order to keep things focussed on developing Processing.js, comments that are intended to derail an issue, or derailed discussions that keep going in issues, may end up getting deleted, or have the issue closed and a new one made with all the information that was relevant to the issue copied over, but nothing else.

### "No one complains in any of the other projects I contribute to about this"

Code of conduct may vary from place to place, so if you want to contribute to Processing.js, this is the code of conduct we all promise to abide by. If you can't (and sometimes, you really can't), then there are tons of other projects that you can contribute to.

## If you use IRC: IRC is asynchronous - if you won't be able to stick around, file issues instead

If you're using the IRC channel (#processingjs on irc.mozilla.org) and you want to discuss any of the contribution steps, be aware that IRC is asynchronous: people are in different timezones and many use "bouncers" which allow their IRC connection to stay open even when they are not behind the computer right now. If you want to ask a question, ask your question and then wait for someone to look in to answer it. Don't ask "is anyone here" or say "I have a question" and then wait for people to respond: people will look into the channel and have no idea when you asked that, so unless there is a real question or comment they can meaningfully respond to, they will just look away again and you will probably never get a response when the channel is quiet.

Also, reporting bugs in IRC is useful, but always also file an issue, so that when people leave IRC, that information can still be found somewhere.


## What happens with my contributions? Will I get credit?

As an open source project, everything you send to be merged into Processing.js becomes part of Processing.js, without any ownership attached to it. Code and documentation, insofar as it is unique to Processing.js, simply becomes part of "Processing.js", without authorship, and covered by an MIT license.
