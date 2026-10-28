import { Module } from '@nestjs/common';
import { DrizzleModule } from './db/drizzle.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ChildrenModule } from './children/children.module';
import { RelationshipModule } from './relationship/relationship.module';
import { DiagnosesModule } from './diagnoses/diagnoses.module';
import { TherapyModule } from './therapy/therapy.module';
import { AllergiesModule } from './allergies/allergies.module';
import { ClinicalDataModule } from './clinical-data/clinical-data.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { CalendarModule } from './calendar/calendar.module';
import { NotifyModule } from './notify/notify.module';
import { ForumModule } from './forum/forum.module';
import { CommentsModule } from './comments/comments.module';
import { LikesModule } from './likes/likes.module';
import { AiAssistantModule } from './ai-assistant/ai-assistant.module';
import { LibraryModule } from './library/library.module';
import { MediaModule } from './media/media.module';
import { UserConfigModule } from './user-config/user-config.module';
import { RightsAndBenefitsModule } from './rights-and-benefits/rights-and-benefits.module';
import { MedicationsModule } from './medications/medications.module';
import { PrescriptionsModule } from './prescriptions/prescriptions.module';

@Module({
  imports: [
    DrizzleModule,
    UsersModule,
    AuthModule,
    ChildrenModule,
    RelationshipModule,
    DiagnosesModule,
    TherapyModule,
    AllergiesModule,
    ClinicalDataModule,
    AppointmentsModule,
    CalendarModule,
    NotifyModule,
    ForumModule,
    CommentsModule,
    LikesModule,
    AiAssistantModule,
    LibraryModule,
    MediaModule,
    UserConfigModule,
    RightsAndBenefitsModule,
    MedicationsModule,
    PrescriptionsModule,
  ],
})
export class AppModule {}
