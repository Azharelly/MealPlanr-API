import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RecipesModule } from './recipes/recipes.module';
import { CalendarModule } from './calendar/calendar.module';
import { GroupsModule } from './groups/groups.module';
import { AnalysisModule } from './analysis/analysis.module';
import { ShoppingListModule } from './shopping-list/shopping-list.module';
import { NlpModule } from './nlp/nlp.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres' as const,
        host: configService.get<string>('DB_HOST'),
        port: parseInt(configService.get<string>('DB_PORT') ?? '5432'),
        username: configService.get<string>('DB_USERNAME'),
        password: String(configService.get('DB_PASSWORD')),
        database: configService.get<string>('DB_NAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true,


      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    RecipesModule,
    CalendarModule,
    GroupsModule,
    ShoppingListModule,
    AnalysisModule,
    NlpModule,
  ],
})
export class AppModule { }