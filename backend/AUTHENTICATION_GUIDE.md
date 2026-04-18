# NestJS Authentication Guide - From Express to NestJS

## 🔄 Express vs NestJS Authentication

### **Express.js (Traditional Approach)**
```javascript
// Express middleware approach
const jwt = require('jsonwebtoken');

// Middleware function
function authenticateToken(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next(); // Continue to next middleware/route handler
  });
}

// Using the middleware
app.get('/protected', authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

// Public route (no middleware)
app.get('/public', (req, res) => {
  res.json({ message: 'Public data' });
});
```

**Express Flow:**
```
Request → Middleware Chain → Route Handler → Response
          ↓
    authenticateToken
          ↓
    Verify JWT manually
          ↓
    Attach user to req.user
```

---

### **NestJS (Modern Approach)**
```typescript
// NestJS uses Guards, Strategies, and Decorators
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { CurrentUser } from './auth/decorators/current-user.decorator';

// Protected route (uses guard)
@UseGuards(JwtAuthGuard)
@Get('protected')
getProtected(@CurrentUser() user: User) {
  return { user };
}

// Public route (uses @Public() decorator)
@Public()
@Get('public')
getPublic() {
  return { message: 'Public data' };
}
```

**NestJS Flow:**
```
Request → Guards → Interceptors → Route Handler → Response
           ↓
      JwtAuthGuard
           ↓
      JwtStrategy
           ↓
    Validate & attach user
```

---

## 🛡️ GUARDS - The Gatekeepers

### **What are Guards?**
Guards are like **bouncers at a club entrance**. They decide if a request can proceed to the route handler.

Think of Express middleware, but:
- ✅ More structured and reusable
- ✅ Return `true` (allow) or `false` (block)
- ✅ Can be applied globally, at controller level, or route level
- ✅ Execute **before** interceptors and pipes

### **Express Equivalent:**
```javascript
// Express middleware
function authMiddleware(req, res, next) {
  if (authenticated) {
    next(); // Allow
  } else {
    res.status(401).send(); // Block
  }
}
```

### **NestJS Guard:**
```typescript
// Guards return boolean or throw exception
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext): boolean {
    // Return true = Allow request
    // Return false = Block request (401 Unauthorized)
    // Throw exception = Block with custom error
    
    const isPublic = this.checkIfPublic(context);
    if (isPublic) return true; // Skip auth for public routes
    
    return super.canActivate(context); // Validate JWT
  }
}
```

### **Your JwtAuthGuard Explained:**

**File:** `src/auth/guards/jwt-auth.guard.ts`

```typescript
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    // Step 1: Check if route has @Public() decorator
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),  // Check method: @Get('login')
      context.getClass(),    // Check controller: @Controller('auth')
    ]);
    
    // Step 2: If public, skip authentication
    if (isPublic) {
      return true; // Allow without token
    }
    
    // Step 3: If protected, validate JWT token
    return super.canActivate(context);
    // This calls PassportStrategy which validates token
  }
}
```

**What happens inside `super.canActivate()`:**
1. Extracts token from `Authorization: Bearer <token>` header
2. Verifies token signature with `JWT_SECRET`
3. Decodes payload: `{ email, sub (userId), role }`
4. Calls `JwtStrategy.validate()` with decoded payload
5. Returns `true` if valid, `false` if invalid

### **Guard Levels:**

```typescript
// 1. GLOBAL GUARD (all routes protected by default)
// app.module.ts
providers: [
  {
    provide: APP_GUARD,
    useClass: JwtAuthGuard, // ← Protects EVERYTHING
  },
]

// 2. CONTROLLER GUARD (all routes in this controller)
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {}

// 3. ROUTE GUARD (single route only)
@UseGuards(JwtAuthGuard)
@Get('profile')
getProfile() {}
```

---

## 📦 STRATEGIES - The Validators

### **What are Strategies?**
Strategies are **authentication algorithms**. They define **HOW** to validate credentials.

In your project, you use **Passport.js strategies** (same as Express, but integrated differently).

### **Express with Passport:**
```javascript
// Express setup
const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;

// Define strategy
passport.use(new JwtStrategy(options, (payload, done) => {
  User.findById(payload.sub, (err, user) => {
    if (err) return done(err, false);
    if (user) return done(null, user);
    return done(null, false);
  });
}));

// Use middleware
app.get('/profile', 
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    res.json({ user: req.user });
  }
);
```

### **NestJS with Passport:**
```typescript
// NestJS integrates Passport as a service
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: any) {
    // This is called AFTER token is verified
    const user = await this.usersService.findOne(payload.sub);
    if (!user) throw new UnauthorizedException();
    return user; // Becomes request.user
  }
}
```

### **Your JwtStrategy Explained:**

**File:** `src/auth/strategies/jwt.strategy.ts`

```typescript
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UsersService) {
    // Configure HOW to extract and verify token
    super({
      // WHERE to find the token
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // Extract from: Authorization: Bearer <token>
      
      // Reject expired tokens?
      ignoreExpiration: false, // Yes, reject old tokens
      
      // Secret key to verify signature
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  // Called AFTER token signature is verified
  async validate(payload: any) {
    // payload = decoded JWT data
    // { email: 'user@example.com', sub: 'uuid', role: 'customer' }
    
    // Fetch fresh user data from database
    const user = await this.usersService.findOne(payload.sub);
    
    if (!user) {
      // User was deleted after token was issued
      throw new UnauthorizedException();
    }
    
    // Return user object
    // This becomes: request.user
    return user;
  }
}
```

**Complete Flow with Strategy:**
```
1. Request with header: Authorization: Bearer eyJhbGc...
                                              ↓
2. JwtAuthGuard intercepts request
                                              ↓
3. Passport extracts token: "eyJhbGc..."
                                              ↓
4. Verify signature with JWT_SECRET
                                              ↓
5. Decode payload: { email, sub, role, iat, exp }
                                              ↓
6. Call JwtStrategy.validate(payload)
                                              ↓
7. Fetch user from database by payload.sub (user ID)
                                              ↓
8. Attach user to request: request.user = user
                                              ↓
9. Controller can access via @CurrentUser() decorator
```

### **Multiple Strategies Example:**

You can have different strategies for different auth methods:

```typescript
// JWT Strategy (for bearer tokens)
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {}

// Local Strategy (for username/password)
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {}

// OAuth Strategy (for Google/Facebook)
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {}

// Usage:
@UseGuards(AuthGuard('jwt'))     // Use JWT strategy
@UseGuards(AuthGuard('local'))   // Use Local strategy
@UseGuards(AuthGuard('google'))  // Use Google OAuth
```

---

## 🏷️ DECORATORS - The Helpers

### **What are Decorators?**
Decorators are **metadata attachments** and **helper functions**. They modify or extract data from classes, methods, or parameters.

Think of them as **annotations** or **labels** that add functionality.

### **Types of Decorators in NestJS:**

#### **1. Route Decorators** (Define endpoints)
```typescript
@Controller('users')  // Creates /users route
@Get()                // HTTP GET method
@Post()               // HTTP POST method
@Patch(':id')         // PATCH with parameter
@Delete(':id')        // DELETE with parameter
```

#### **2. Parameter Decorators** (Extract request data)
```typescript
@Body()        // Extract request body
@Param('id')   // Extract URL parameter
@Query()       // Extract query string
@Headers()     // Extract headers
```

#### **3. Custom Decorators** (Your own helpers)

### **Your Custom Decorators:**

#### **A) @Public() Decorator**

**File:** `src/auth/decorators/public.decorator.ts`

```typescript
// Metadata key
export const IS_PUBLIC_KEY = 'isPublic';

// Decorator function
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
```

**What it does:**
- Attaches metadata to a route: `{ 'isPublic': true }`
- JwtAuthGuard reads this metadata
- If `isPublic = true`, guard skips authentication

**Usage:**
```typescript
@Public()  // ← This route doesn't need JWT token
@Post('login')
login() {
  return 'Anyone can access';
}
```

**Express Equivalent:**
```javascript
// No middleware = public route
app.post('/login', (req, res) => {
  // No auth required
});
```

---

#### **B) @CurrentUser() Decorator**

**File:** `src/auth/decorators/current-user.decorator.ts`

```typescript
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    // Extract request object
    const request = ctx.switchToHttp().getRequest();
    
    // Return user attached by JwtStrategy
    return request.user;
  },
);
```

**What it does:**
- Extracts `request.user` (set by JwtStrategy)
- Passes it as a parameter to your route handler
- Cleaner than accessing `request.user` directly

**Usage:**
```typescript
@Get('profile')
getProfile(@CurrentUser() user: User) {
  // user is already typed and extracted
  console.log(user.email);
  console.log(user.id);
  return user;
}
```

**Express Equivalent:**
```javascript
app.get('/profile', authenticateToken, (req, res) => {
  const user = req.user; // Manual extraction
  res.json({ user });
});
```

---

## 🔗 HOW IT ALL WORKS TOGETHER

### **Complete Authentication Flow:**

```
┌─────────────────────────────────────────────────────────┐
│  1. USER LOGS IN                                        │
└─────────────────────────────────────────────────────────┘
    POST /auth/login
    Body: { email, password }
              ↓
    @Public() decorator → Skip JWT guard
              ↓
    AuthService.login()
              ↓
    Validate credentials with bcrypt
              ↓
    Generate JWT token:
    payload = { email, sub: userId, role }
    token = jwt.sign(payload, JWT_SECRET)
              ↓
    Return: { access_token: "eyJhbGc...", user: {...} }


┌─────────────────────────────────────────────────────────┐
│  2. USER ACCESSES PROTECTED ROUTE                       │
└─────────────────────────────────────────────────────────┘
    GET /users
    Headers: { Authorization: "Bearer eyJhbGc..." }
              ↓
    ┌─────────────────────────────────┐
    │  JwtAuthGuard (Guard)           │
    ├─────────────────────────────────┤
    │ • Check @Public() decorator     │
    │ • Not public? Validate token    │
    └─────────────────────────────────┘
              ↓
    ┌─────────────────────────────────┐
    │  Passport.js                    │
    ├─────────────────────────────────┤
    │ • Extract token from header     │
    │ • Verify signature with secret  │
    │ • Decode payload                │
    └─────────────────────────────────┘
              ↓
    ┌─────────────────────────────────┐
    │  JwtStrategy (Strategy)         │
    ├─────────────────────────────────┤
    │ • Receive decoded payload       │
    │ • Fetch user from database      │
    │ • Attach to request.user        │
    └─────────────────────────────────┘
              ↓
    ┌─────────────────────────────────┐
    │  UsersController (Handler)      │
    ├─────────────────────────────────┤
    │ • @CurrentUser() extracts user  │
    │ • Execute business logic        │
    │ • Return response               │
    └─────────────────────────────────┘
              ↓
    Response: { users: [...] }
```

---

## 📝 COMPARISON TABLE

| Concept | Express | NestJS | Benefit |
|---------|---------|--------|---------|
| **Auth Check** | Middleware function | Guard class | More structured, reusable |
| **Token Validation** | Manual jwt.verify() | Strategy (Passport) | Standardized, configurable |
| **User Extraction** | req.user | @CurrentUser() decorator | Type-safe, cleaner |
| **Public Routes** | No middleware | @Public() decorator | Explicit, readable |
| **Global Protection** | Apply to all routes | APP_GUARD provider | Automatic, unmissable |
| **Dependency Injection** | Manual requires | Constructor injection | Testable, maintainable |

---

## 🎯 KEY CONCEPTS SUMMARY

### **1. Guards = Middleware (Enhanced)**
- Execute **before** route handler
- Return `true` (allow) or `false` (block)
- Can be global, controller-level, or route-level
- **Your Guard:** `JwtAuthGuard` checks JWT tokens

### **2. Strategies = Validation Logic**
- Define **HOW** to authenticate
- Passport.js integration
- Executed by Guards
- **Your Strategy:** `JwtStrategy` validates tokens and fetches users

### **3. Decorators = Metadata + Helpers**
- **@Public()** - Mark routes as public
- **@CurrentUser()** - Extract authenticated user
- **@UseGuards()** - Apply guard to route
- **@Body(), @Param()** - Extract request data

---

## 🔍 DEBUGGING TIPS

### **Check if user is authenticated:**
```typescript
@Get('test')
test(@CurrentUser() user: User) {
  console.log('User:', user); // Should see user object
  return { authenticated: !!user };
}
```

### **Test token manually:**
```bash
# Decode JWT token (without verification)
# Visit: https://jwt.io
# Paste your token to see payload
```

### **Common Issues:**

1. **401 Unauthorized on public routes**
   - ❌ Missing `@Public()` decorator
   - ✅ Add `@Public()` to route

2. **User is null in controller**
   - ❌ JwtStrategy not returning user
   - ✅ Check if user exists in database

3. **Token not found**
   - ❌ Missing `Authorization: Bearer` header
   - ✅ Send header: `Authorization: Bearer <token>`

---

## 📚 FURTHER READING

- **NestJS Guards:** https://docs.nestjs.com/guards
- **NestJS Authentication:** https://docs.nestjs.com/security/authentication
- **Passport.js Strategies:** http://www.passportjs.org/
- **Custom Decorators:** https://docs.nestjs.com/custom-decorators

---

**Your authentication system is production-ready! 🎉**

All routes are protected by default. Use `@Public()` for public endpoints. Use `@CurrentUser()` to access the authenticated user.
