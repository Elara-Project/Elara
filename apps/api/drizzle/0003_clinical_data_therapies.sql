CREATE TABLE `ClinicalDataTherapies` (
	`ClinicalData_idClinicalData` int NOT NULL,
	`Therapy_idTherapy` int NOT NULL,
	CONSTRAINT `pk_clinical_data_therapies` PRIMARY KEY(`ClinicalData_idClinicalData`,`Therapy_idTherapy`)
);
--> statement-breakpoint
ALTER TABLE `ClinicalDataTherapies` ADD CONSTRAINT `fk_clindatatherapies_data` FOREIGN KEY (`ClinicalData_idClinicalData`) REFERENCES `ClinicalData`(`idClinicalData`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ClinicalDataTherapies` ADD CONSTRAINT `fk_clindatatherapies_therapy` FOREIGN KEY (`Therapy_idTherapy`) REFERENCES `Therapy`(`idTherapy`) ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
INSERT INTO `ClinicalDataTherapies` (`ClinicalData_idClinicalData`, `Therapy_idTherapy`)
SELECT `idClinicalData`, `Therapy_idTherapy`
FROM `ClinicalData`
WHERE `Therapy_idTherapy` IS NOT NULL;
