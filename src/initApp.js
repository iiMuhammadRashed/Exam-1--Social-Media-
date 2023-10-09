import morgan from 'morgan';
import { AppError } from './utils/AppError.js';
import authRouter from './modules/auth/auth.routes.js';
import userRouter from './modules/user/user.routes.js';
import adminRouter from './modules/admin/admin.routes.js';
import postRouter from './modules/post/post.routes.js';

export function initApp(app, express) {
  // Middleware
  app.use(express.json());
  app.use(morgan('dev'));

  // APIs Endpoints
  app.use('/api/v1/users', userRouter);
  app.use('/api/v1/auth', authRouter);
  app.use('/api/v1/admins', adminRouter);
  app.use('/api/v1/posts', postRouter);

  // Does't Exist Endpoints
  app.all('*', (req, res, next) => {
    next(new AppError(`Invalid endpoint ${req.originalUrl}`, 404));
  });
}
