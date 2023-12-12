1. While doing code task I've experienced few issues, which stopped me from doing some required points.
   In particularly:

- test coverage - I did not write any supertest tests, as all of them were failing with weird errors about imports
  resolve or Database service injection issues. I tries look in official docs/github issues/chatgpt
  for few hours, but no results. I've also tried to apply traditional api tests and run them with
  built-in jest config, but for some reason jest keep failing with empty `Aggregation` error, so
  I've decided to proceed with other topics and skip this entirely, due to limited time.
- docker setup - while building image for some reason Prisma was continue to fail to generate prisma-client due to
  my arm macos. I've tried to use different node versions, different binaryTargets in prisma config, but no luck.
  I also saw [this issue](https://github.com/prisma/prisma/issues/16901), which seems to be not resolved. Unfortunately
  I started to dockerise nodejs app in the end, so it was too late to change ORM.

Also few points worth mentioning on this part:

- as for test coverage - I believe that not all code is this assignment should be covered by unit tests. In
  particularly, covering `users` module makes no sense, as all it does is proxying http calls to
  ORM, with almost no extra logic. And since testing 3rd party code is a bad practice, I would omit tests
  for this module entirely. As for `auth` module, there are few things needs to be covered, including tests for
  `AuthGuard` ( accessing protected route with and without token, public route without token ), `signUp` (input validation, existing user) and `signIn` ( input validation, token generation )
- as for logging - I've added built-in logger with difference on log level depending on environment. Further
  I would consider adding custom logger for production use, where logs would have JSON or other standardized
  format, so later these logs could be easily processed by tools like Elasticsearch.
- error handling - I followed official docs on [authorisation](https://docs.nestjs.com/security/authentication#jwt-token), but I'm not quite agree/understand the approach.
  As far as I understand different nest.js entities stands for supporting separations of concerns ( controller stands for http
  interactions, and service suppose do lower-level work, like interacting with database, generating tokens and so on ).
  But in example provided exception `UnauthorizedException` was used in `AuthService` is described in [built in HTTP exceptions](https://docs.nestjs.com/exception-filters#built-in-http-exceptions),
  which on my opinion violates separations of concerns principle, as it brings HTTP related things ( which belongs closer to controllers on my opinion )
  to service, which is not supposed to operate on http level directly, and potentially could be migrated to serve other
  transport layer. There is `signUp` route handler where I use these built-in http errors the way I think is better.
- performance - I left default `express` underlying server, even it is much worse in terms of performance than `fastify`,
  because there are points 2 and 3 which partially cover this part as well, so I decided to leave `express` and add my thoughts
  on performance for other points. Also I know that some js features I used like object destructing is much slower
  than just accessing data by dot 'object.prop', so I left that for now, but that could be potential candidate for improvement
  if performance metrics would show bottleneck in js code.

2. There are many ways how we can handle more load. First which comes to mind are quite blunt:

- split current service into few different, like registration and signin/signout - that would allow us to scale different parts independently ( since signin/signout endpoints will have much more load )
- if bottleneck would be database queries we could use database sharding with load balanced to distribute load in an efficient way
- we could apply throttle and queue system to avoid abuse and handle peak time loads
- try changing nodejs runtime to something more efficient like Bun
- try replace javascript language for this service entirely, as it is known to be not the best language for doing heavy math ( encoding, decoding, hashing )

3. SSO is a very neat and expected feature from all modern web apps. Sequence diagram:

- User visits our signup/signin page and clicks on SSO button
- After click user is redirected to OAuth login page
- User logs in and authorizes
- SSO provider sends auth code to our backend
- Our backend sends auth code to SSO provider
- SSO provider sends back access token
- Our backend asks for user details using access token
- After receiving user details, our backend could create user if needed, generate JWT, and redirect back to our main page
