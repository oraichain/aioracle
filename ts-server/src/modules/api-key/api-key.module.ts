import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import config from 'src/config';
import { HttpModule } from '@nestjs/axios';
import { ApiKeyService, CollectionSimilarService } from './services';
import { ApiKeyController, CollectionSimilarController, CollectionSimilarInternalController } from './controllers';
import { AuthApikeyMiddleware, AuthInternalMiddleware } from './middleware';

@Module({
  controllers: [ApiKeyController, CollectionSimilarController, CollectionSimilarInternalController],
  providers: [ApiKeyService, CollectionSimilarService],
  imports: [
    HttpModule.registerAsync({
      useFactory: () => ({
        timeout: 60000,
        maxRedirects: 5,
        baseURL: config.AI_URL,
      }),
    }),
  ],
})
export class ApiKeyModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthApikeyMiddleware).forRoutes(CollectionSimilarController, ApiKeyController);
    consumer.apply(AuthInternalMiddleware).forRoutes(CollectionSimilarInternalController);
  }
}
// export class AIJobModule implements NestModule {
//   configure(consumer: MiddlewareConsumer): void {
//     consumer
//       .apply(
//         PaginationMiddleware({
//           filterFields: ['statuses', 'publicAddress', 'types'],
//           sortFields: ['createdAt', 'updatedAt'],
//           defaultSort: { field: 'createdAt', order: 'ASC' },
//         }),
//       )
//       .forRoutes({ path: '/ai-jobs', method: RequestMethod.GET });
//   }
// }
