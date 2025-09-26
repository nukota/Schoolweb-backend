import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ClassesModule } from './classes/classes.module';
import { SubjectsModule } from './subjects/subjects.module';
import { EnrollmentsModule } from './enrollments/enrollments.module';
import { StudentProfilesModule } from './student-profiles/student-profiles.module';
import { TeacherProfilesModule } from './teacher-profiles/teacher-profiles.module';
import { RequestsModule } from './requests/requests.module';

// Import all entities
import { User } from './users/entities/user.entity';
import { Class } from './classes/entities/class.entity';
import { Subject } from './subjects/entities/subject.entity';
import { Enrollment } from './enrollments/entities/enrollment.entity';
import { StudentProfile } from './student-profiles/entities/student-profile.entity';
import { TeacherProfile } from './teacher-profiles/entities/teacher-profile.entity';
import { Request } from './requests/entities/request.entity';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [
    // Configuration module - load environment variables
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // TypeORM configuration
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        entities: [
          User,
          Class,
          Subject,
          Enrollment,
          StudentProfile,
          TeacherProfile,
          Request,
        ],
        // synchronize: configService.get('NODE_ENV') === 'development', // Only in development
        logging: configService.get('NODE_ENV') === 'development',
      }),
      inject: [ConfigService],
    }),

    // Feature modules
    AuthModule,
    UsersModule,
    ClassesModule,
    SubjectsModule,
    EnrollmentsModule,
    StudentProfilesModule,
    TeacherProfilesModule,
    RequestsModule,
    DashboardModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
