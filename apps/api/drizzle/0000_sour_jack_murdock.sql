CREATE TABLE `aIAssistent` (
	`idChat` int AUTO_INCREMENT NOT NULL,
	`User_idUser` int NOT NULL,
	`questions` text NOT NULL,
	`answer` text NOT NULL,
	`dateTime` datetime NOT NULL,
	CONSTRAINT `aIAssistent_idChat` PRIMARY KEY(`idChat`)
);
--> statement-breakpoint
CREATE TABLE `Allergies` (
	`idAllergies` int AUTO_INCREMENT NOT NULL,
	`allergenName` varchar(150) NOT NULL,
	`severity` int NOT NULL,
	`Qtt` int NOT NULL DEFAULT 0,
	CONSTRAINT `Allergies_idAllergies` PRIMARY KEY(`idAllergies`)
);
--> statement-breakpoint
CREATE TABLE `Appointments` (
	`idAppointments` int AUTO_INCREMENT NOT NULL,
	`appointmentDateTime` datetime NOT NULL,
	`status` enum('agendado','confirmado','concluido','cancelado','remarcado') NOT NULL,
	`reason` varchar(50) NOT NULL,
	`local` varchar(200) NOT NULL,
	`notes` varchar(100) NOT NULL,
	`ClinicalData_idClinicalData` int NOT NULL,
	CONSTRAINT `Appointments_idAppointments` PRIMARY KEY(`idAppointments`)
);
--> statement-breakpoint
CREATE TABLE `Calendar` (
	`idCalendar` int AUTO_INCREMENT NOT NULL,
	`Appointments_idAppointments` int NOT NULL,
	`date` datetime NOT NULL,
	`status` enum('agendado','confirmado','concluido','cancelado','remarcado') NOT NULL,
	`descript` varchar(45) NOT NULL,
	CONSTRAINT `Calendar_idCalendar` PRIMARY KEY(`idCalendar`)
);
--> statement-breakpoint
CREATE TABLE `Children` (
	`idChildren` int AUTO_INCREMENT NOT NULL,
	`Name` varchar(200) NOT NULL,
	`Dob` datetime NOT NULL,
	`DateCreate` datetime NOT NULL,
	`Relationship_idRelationship` int NOT NULL,
	`User_idUser` int NOT NULL,
	`Diagnoses_idDiagnoses` int,
	`ClinicalData_idClinicalData` int,
	CONSTRAINT `Children_idChildren` PRIMARY KEY(`idChildren`)
);
--> statement-breakpoint
CREATE TABLE `ClinicalData` (
	`idClinicalData` int AUTO_INCREMENT NOT NULL,
	`FamilyHistory` varchar(100) NOT NULL,
	`observations` varchar(300) NOT NULL,
	`lastUpdate` datetime NOT NULL,
	`Therapy_idTherapy` int,
	`Allergies_idAllergies` int,
	CONSTRAINT `ClinicalData_idClinicalData` PRIMARY KEY(`idClinicalData`)
);
--> statement-breakpoint
CREATE TABLE `Comments` (
	`idComments` int AUTO_INCREMENT NOT NULL,
	`content` text NOT NULL,
	`status` enum('visivel','oculto','denunciado','removido') NOT NULL,
	`createAt` datetime NOT NULL,
	`updateAt` datetime NOT NULL,
	`Forum_idForum` int NOT NULL,
	`User_idUser` int NOT NULL,
	`editedByAdminId` int,
	`previousContent` text,
	`editedAt` datetime,
	CONSTRAINT `Comments_idComments` PRIMARY KEY(`idComments`)
);
--> statement-breakpoint
CREATE TABLE `Diagnoses` (
	`idDiagnoses` int AUTO_INCREMENT NOT NULL,
	`NameDiagnosis` varchar(150) NOT NULL,
	`Stage` int NOT NULL,
	`Qtt` int NOT NULL DEFAULT 0,
	CONSTRAINT `Diagnoses_idDiagnoses` PRIMARY KEY(`idDiagnoses`)
);
--> statement-breakpoint
CREATE TABLE `Forum` (
	`idForum` int AUTO_INCREMENT NOT NULL,
	`title` varchar(45) NOT NULL,
	`Diagnoses_idDiagnoses` int NOT NULL,
	`descript` varchar(200) NOT NULL,
	`createDate` datetime NOT NULL,
	CONSTRAINT `Forum_idForum` PRIMARY KEY(`idForum`)
);
--> statement-breakpoint
CREATE TABLE `library` (
	`idlibrary` int AUTO_INCREMENT NOT NULL,
	`name` varchar(45) NOT NULL,
	`descript` varchar(300) NOT NULL,
	`icon` varchar(300) NOT NULL,
	CONSTRAINT `library_idlibrary` PRIMARY KEY(`idlibrary`)
);
--> statement-breakpoint
CREATE TABLE `Likes` (
	`idLikes` int AUTO_INCREMENT NOT NULL,
	`Comments_idComments` int NOT NULL,
	`User_idUser` int NOT NULL,
	`date` datetime NOT NULL,
	CONSTRAINT `Likes_idLikes` PRIMARY KEY(`idLikes`),
	CONSTRAINT `Likes_Comments_idComments_User_idUser_unique` UNIQUE(`Comments_idComments`,`User_idUser`)
);
--> statement-breakpoint
CREATE TABLE `media` (
	`idmedia` int AUTO_INCREMENT NOT NULL,
	`User_idUser` int NOT NULL,
	`library_idlibrary` int NOT NULL,
	`Children_idChildren` int NOT NULL,
	`title` varchar(50) NOT NULL,
	`descript` varchar(300) NOT NULL,
	`imageUrl` varchar(500) NOT NULL,
	`date` datetime NOT NULL,
	`status` tinyint NOT NULL,
	CONSTRAINT `media_idmedia` PRIMARY KEY(`idmedia`)
);
--> statement-breakpoint
CREATE TABLE `CurrentMedications` (
	`idCurrentMedications` int AUTO_INCREMENT NOT NULL,
	`medicineName` varchar(100) NOT NULL,
	`route` varchar(45) NOT NULL,
	`instructions` varchar(300) NOT NULL,
	`qtt` int NOT NULL DEFAULT 0,
	CONSTRAINT `CurrentMedications_idCurrentMedications` PRIMARY KEY(`idCurrentMedications`)
);
--> statement-breakpoint
CREATE TABLE `Notify` (
	`idNotify` int AUTO_INCREMENT NOT NULL,
	`Calendar_idCalendar` int NOT NULL,
	`notifyDate` datetime NOT NULL,
	`sent` tinyint NOT NULL,
	`descript` varchar(45) NOT NULL,
	CONSTRAINT `Notify_idNotify` PRIMARY KEY(`idNotify`)
);
--> statement-breakpoint
CREATE TABLE `Prescriptions` (
	`ClinicalData_idClinicalData` int NOT NULL,
	`Medications_idCurrentMedications` int NOT NULL,
	`frequency` varchar(45) NOT NULL,
	`Status` tinyint NOT NULL,
	`startDate` datetime NOT NULL,
	`endDate` datetime NOT NULL,
	CONSTRAINT `pk_prescriptions` PRIMARY KEY(`ClinicalData_idClinicalData`,`Medications_idCurrentMedications`)
);
--> statement-breakpoint
CREATE TABLE `Relationship` (
	`idRelationship` int AUTO_INCREMENT NOT NULL,
	`Relationship` varchar(45) NOT NULL,
	`Qtt` int NOT NULL DEFAULT 0,
	CONSTRAINT `Relationship_idRelationship` PRIMARY KEY(`idRelationship`)
);
--> statement-breakpoint
CREATE TABLE `RightsAndBenefits` (
	`idRightsAndBenefits` int AUTO_INCREMENT NOT NULL,
	`User_idUser` int NOT NULL,
	`title` varchar(45) NOT NULL,
	`category` enum('saude','educacao','financeiro','tributario','transporte','trabalho','lazer_acessibilidade') NOT NULL,
	`type` enum('bpc_loas','isencao_fiscal','passe_livre','aee','prioridade_atendimento','cotas_trabalhistas','carteira_estacionamento','outro') NOT NULL,
	`descript` varchar(200) NOT NULL,
	`status` tinyint NOT NULL,
	CONSTRAINT `RightsAndBenefits_idRightsAndBenefits` PRIMARY KEY(`idRightsAndBenefits`)
);
--> statement-breakpoint
CREATE TABLE `Therapy` (
	`idTherapy` int AUTO_INCREMENT NOT NULL,
	`nameTherapy` varchar(100) NOT NULL,
	`type` varchar(45) NOT NULL,
	`Qtt` int NOT NULL DEFAULT 0,
	CONSTRAINT `Therapy_idTherapy` PRIMARY KEY(`idTherapy`)
);
--> statement-breakpoint
CREATE TABLE `User` (
	`idUser` int AUTO_INCREMENT NOT NULL,
	`Name` varchar(200) NOT NULL,
	`Email` varchar(200) NOT NULL,
	`Senha` varchar(255) NOT NULL,
	`Status` tinyint NOT NULL,
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`DateCreate` datetime NOT NULL,
	CONSTRAINT `User_idUser` PRIMARY KEY(`idUser`),
	CONSTRAINT `User_Email_unique` UNIQUE(`Email`)
);
--> statement-breakpoint
CREATE TABLE `UserConfig` (
	`User_idUser` int NOT NULL,
	`notify` tinyint NOT NULL,
	`theme` tinyint NOT NULL,
	`privacity` tinyint NOT NULL,
	`updateDate` datetime NOT NULL,
	CONSTRAINT `UserConfig_User_idUser` PRIMARY KEY(`User_idUser`)
);
--> statement-breakpoint
ALTER TABLE `aIAssistent` ADD CONSTRAINT `aIAssistent_User_idUser_User_idUser_fk` FOREIGN KEY (`User_idUser`) REFERENCES `User`(`idUser`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `Appointments` ADD CONSTRAINT `fk_appointments_clinicaldata` FOREIGN KEY (`ClinicalData_idClinicalData`) REFERENCES `ClinicalData`(`idClinicalData`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `Calendar` ADD CONSTRAINT `fk_calendar_appointments` FOREIGN KEY (`Appointments_idAppointments`) REFERENCES `Appointments`(`idAppointments`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `Children` ADD CONSTRAINT `Children_User_idUser_User_idUser_fk` FOREIGN KEY (`User_idUser`) REFERENCES `User`(`idUser`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `Children` ADD CONSTRAINT `Children_Diagnoses_idDiagnoses_Diagnoses_idDiagnoses_fk` FOREIGN KEY (`Diagnoses_idDiagnoses`) REFERENCES `Diagnoses`(`idDiagnoses`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `Children` ADD CONSTRAINT `fk_children_relationship` FOREIGN KEY (`Relationship_idRelationship`) REFERENCES `Relationship`(`idRelationship`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `Children` ADD CONSTRAINT `fk_children_clinicaldata` FOREIGN KEY (`ClinicalData_idClinicalData`) REFERENCES `ClinicalData`(`idClinicalData`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ClinicalData` ADD CONSTRAINT `ClinicalData_Therapy_idTherapy_Therapy_idTherapy_fk` FOREIGN KEY (`Therapy_idTherapy`) REFERENCES `Therapy`(`idTherapy`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ClinicalData` ADD CONSTRAINT `ClinicalData_Allergies_idAllergies_Allergies_idAllergies_fk` FOREIGN KEY (`Allergies_idAllergies`) REFERENCES `Allergies`(`idAllergies`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `Comments` ADD CONSTRAINT `Comments_Forum_idForum_Forum_idForum_fk` FOREIGN KEY (`Forum_idForum`) REFERENCES `Forum`(`idForum`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `Comments` ADD CONSTRAINT `Comments_User_idUser_User_idUser_fk` FOREIGN KEY (`User_idUser`) REFERENCES `User`(`idUser`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `Comments` ADD CONSTRAINT `Comments_editedByAdminId_User_idUser_fk` FOREIGN KEY (`editedByAdminId`) REFERENCES `User`(`idUser`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `Forum` ADD CONSTRAINT `Forum_Diagnoses_idDiagnoses_Diagnoses_idDiagnoses_fk` FOREIGN KEY (`Diagnoses_idDiagnoses`) REFERENCES `Diagnoses`(`idDiagnoses`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `Likes` ADD CONSTRAINT `Likes_Comments_idComments_Comments_idComments_fk` FOREIGN KEY (`Comments_idComments`) REFERENCES `Comments`(`idComments`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `Likes` ADD CONSTRAINT `Likes_User_idUser_User_idUser_fk` FOREIGN KEY (`User_idUser`) REFERENCES `User`(`idUser`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `media` ADD CONSTRAINT `media_User_idUser_User_idUser_fk` FOREIGN KEY (`User_idUser`) REFERENCES `User`(`idUser`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `media` ADD CONSTRAINT `media_library_idlibrary_library_idlibrary_fk` FOREIGN KEY (`library_idlibrary`) REFERENCES `library`(`idlibrary`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `media` ADD CONSTRAINT `media_Children_idChildren_Children_idChildren_fk` FOREIGN KEY (`Children_idChildren`) REFERENCES `Children`(`idChildren`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `Notify` ADD CONSTRAINT `Notify_Calendar_idCalendar_Calendar_idCalendar_fk` FOREIGN KEY (`Calendar_idCalendar`) REFERENCES `Calendar`(`idCalendar`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `Prescriptions` ADD CONSTRAINT `fk_prescriptions_clinicaldata` FOREIGN KEY (`ClinicalData_idClinicalData`) REFERENCES `ClinicalData`(`idClinicalData`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `Prescriptions` ADD CONSTRAINT `fk_prescriptions_medications` FOREIGN KEY (`Medications_idCurrentMedications`) REFERENCES `CurrentMedications`(`idCurrentMedications`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `RightsAndBenefits` ADD CONSTRAINT `RightsAndBenefits_User_idUser_User_idUser_fk` FOREIGN KEY (`User_idUser`) REFERENCES `User`(`idUser`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `UserConfig` ADD CONSTRAINT `UserConfig_User_idUser_User_idUser_fk` FOREIGN KEY (`User_idUser`) REFERENCES `User`(`idUser`) ON DELETE no action ON UPDATE no action;