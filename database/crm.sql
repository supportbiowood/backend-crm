CREATE TABLE `person` (
  `person_id` int PRIMARY KEY AUTO_INCREMENT,
  `contact_id` int,
  `person_position` varchar(255),
  `person_first_name` varchar(255),
  `person_last_name` varchar(255),
  `person_nick_name` varchar(255),
  `person_birthdate` int,
  `person_img_url` text
);

CREATE TABLE `contact_channel` (
  `contact_channel_type` varchar(255),
  `ref_id` int,
  `contact_channel_name` varchar(255),
  `contact_channel_detail` varchar(255),
  `contact_channel_detail_2` varchar(255)
);

CREATE TABLE `project_person` (
  `role` varchar(255),
  `person_id` int,
  `project_id` int
);

CREATE TABLE `project` (
  `project_id` int PRIMARY KEY,
  `project_name` varchar(255),
  `project_category` ENUM ('house', 'condo', 'village', 'hotel', 'mall', 'university', 'government', 'factory', 'other'),
  `project_stage` ENUM ('bid', 'spec', 'construction', 'other'),
  `project_value` varchar(255),
  `project_address_id` int,
  `project_billing_category` ENUM ('individual', 'commercial', 'merchant'),
  `project_billing_tax_id` varchar(255),
  `project_billing_business_name` varchar(255),
  `project_billing_name_prefix` ENUM ('mr', 'mrs', 'ms', 'none'),
  `project_billing_first_name` varchar(255),
  `project_billing_last_name` varchar(255),
  `project_billing_address_id` int,
  `project_deal_confidence` ENUM ('10%', '20%', '30%', '40%', '50%', '60%', '80%', '90%', '100%'),
  `project_deal_target_date` int,
  `project_remark` varchar(255),
  `project_status` ENUM ('new', 'ongoing', 'quotation', 'quotation_accepted', 'closed_success', 'closed_fail', 'finished', 'service', 'service_ended'),
  `project_installment_status` ENUM ('inactive', 'active', 'completed'),
  `project_shipment_status` ENUM ('inactive', 'active', 'completed'),
  `project_payment_status` ENUM ('inactive', 'active', 'completed'),
  `project_approval_status` ENUM ('draft', 'submitted', 'rejected', 'approved'),
  `project_approver` int,
  `_project_created` int,
  `_project_createdby` int,
  `_project_lastupdate` int,
  `_project_lastupdateby` int
);

CREATE TABLE `attachment` (
  `attachment_id` int PRIMARY KEY AUTO_INCREMENT,
  `attachment_name` varchar(255),
  `attachment_file_name` varchar(255),
  `attachment_url` text,
  `attachment_type` ENUM ('contact', 'project', 'warranty'),
  `ref_id` int,
  `_attachment_created` int,
  `_attachment_createdby` int,
  `_attachment_lastupdate` int,
  `_attachment_lastupdateby` int
);

CREATE TABLE `project_contact` (
  `contact_id` int,
  `project_id` int
);

CREATE TABLE `project_tag` (
  `project_id` int,
  `tag_id` int
);

CREATE TABLE `contact` (
  `contact_id` int PRIMARY KEY AUTO_INCREMENT,
  `contact_is_customer` boolean,
  `contact_is_vendor` boolean,
  `contact_business_category` ENUM ('individual', 'commercial', 'merchant'),
  `contact_commercial_type` ENUM ('co_ltd', 'part_ltd', 'pub_co_ltd', 'inc'),
  `contact_commercial_name` varchar(255),
  `contact_individual_name_prefix` ENUM ('mr', 'mrs', 'ms', 'none'),
  `contact_individual_first_name` varchar(255),
  `contact_individual_last_name` varchar(255),
  `contact_merchant_name` varchar(255),
  `contact_tax_no` varchar(255),
  `billing_address_id` int,
  `postal_address_id` int,
  `lead_source_id` int,
  `contact_img_url` text,
  `bank_account_id` int,
  `account_receivable_id` int,
  `account_payable_id` int,
  `contact_payment_type` ENUM ('credit', 'cash'),
  `contact_is_credit_limit` boolean,
  `contact_credit_limit` int,
  `_contact_created` int,
  `_contact_createdby` int,
  `_contact_lastupdate` int,
  `_contact_lastupdateby` int
);

CREATE TABLE `lead_source` (
  `lead_source_id` int PRIMARY KEY AUTO_INCREMENT,
  `lead_source_name` varchar(255)
);

CREATE TABLE `bank_account` (
  `bank_account_id` int PRIMARY KEY AUTO_INCREMENT,
  `contact_id` int,
  `bank_account_no` int,
  `bank_account_bank_name` varchar(255),
  `bank_account_type` varchar(255),
  `bank_account_name` varchar(255),
  `bank_account_branch` varchar(255),
  `bank_account_description` varchar(255)
);

CREATE TABLE `account` (
  `account_id` int PRIMARY KEY AUTO_INCREMENT,
  `account_no` int,
  `account_type` varchar(255),
  `account_name` varchar(255),
  `account_description` varchar(255)
);

CREATE TABLE `project_employee` (
  `role` varchar(255),
  `project_id` int,
  `employee_id` int
);

CREATE TABLE `employee` (
  `employee_id` int PRIMARY KEY,
  `employee_firstname` varchar(255),
  `employee_lastname` varchar(255),
  `employee_email` varchar(255),
  `employee_phone` varchar(255),
  `employee_img_url` varchar(255),
  `employee_password` text,
  `employee_status` ENUM ('ok', 'delete'),
  `employee_department` varchar(255),
  `employee_position` varchar(255),
  `_employee_created` int,
  `_employee_createdby` int,
  `_employee_lastupdate` int,
  `_employee_lastupdateby` int,
  `_employee_lastlogin` int
);

CREATE TABLE `contact_tag` (
  `contact_id` int,
  `tag_id` int
);

CREATE TABLE `tag` (
  `tag_id` int,
  `tag_name` varchar(255)
);

CREATE TABLE `event` (
  `event_id` int PRIMARY KEY AUTO_INCREMENT,
  `event_employee_id` int,
  `event_plan_start_date` int,
  `event_plan_end_date` int,
  `event_schedule_start_date` int,
  `event_schedule_end_date` int,
  `event_topic` varchar(255),
  `project_id` int,
  `contact_id` int,
  `person_id` int,
  `event_person_phone` varchar(255),
  `event_project_stage` ENUM ('bid', 'spec', 'construction', 'other'),
  `event_status` ENUM ('planned', 'confirmed', 'cancelled', 'finished'),
  `event_dest_location_name` varchar(255),
  `event_dest_latitude` varchar(255),
  `event_dest_longitude` varchar(255),
  `event_dest_google_map_link` text,
  `event_checkin_start_date` int,
  `event_checkin_start_location_name` varchar(255),
  `event_checkin_start_latitude` varchar(255),
  `event_checkin_start_longitude` varchar(255),
  `event_checkin_dest_date` int,
  `event_checkin_dest_location_name` varchar(255),
  `event_checkin_dest_latitude` varchar(255),
  `event_checkin_dest_longitude` varchar(255),
  `event_distance` int,
  `event_remark` varchar(255),
  `_event_created` int,
  `_event_createdby` int,
  `_event_lastupdate` int,
  `_event_lastupdateby` int
);

CREATE TABLE `warranty` (
  `warranty_id` int PRIMARY KEY AUTO_INCREMENT,
  `project_id` int,
  `warranty_name` varchar(255),
  `warranty_type` ENUM ('product', 'installment', 'service'),
  `warranty_start_date` int,
  `warranty_end_date` int,
  `warranty_approver_name` varchar(255)
);

CREATE TABLE `address` (
  `address_id` int PRIMARY KEY AUTO_INCREMENT,
  `address_name` varchar(255),
  `address_building` varchar(255),
  `address_house_no` varchar(255),
  `address_road` varchar(255),
  `address_village_no` varchar(255),
  `address_sub_district` varchar(255),
  `address_district` varchar(255),
  `address_province` varchar(255),
  `address_country` varchar(255),
  `address_postal_code` varchar(255)
);

CREATE TABLE `project_connection` (
  `project_id` int,
  `connection_type` varchar(255),
  `document_id` varchar(255),
  `_created` int,
  `_createdby` int
);

CREATE TABLE `project_activity` (
  `project_id` int,
  `activity_type` ENUM ('memo', 'appointment', 'checkin', 'shipment', 'sales', 'document', 'image', 'status_change', 'contact_change'),
  `activity_data` json,
  `_project_activity_created` int,
  `_project_activity_createdby` int
);

ALTER TABLE `person` ADD FOREIGN KEY (`contact_id`) REFERENCES `contact` (`contact_id`);

ALTER TABLE `project_person` ADD FOREIGN KEY (`person_id`) REFERENCES `person` (`person_id`);

ALTER TABLE `project_person` ADD FOREIGN KEY (`project_id`) REFERENCES `project` (`project_id`);

ALTER TABLE `project_contact` ADD FOREIGN KEY (`contact_id`) REFERENCES `contact` (`contact_id`);

ALTER TABLE `project_contact` ADD FOREIGN KEY (`project_id`) REFERENCES `project` (`project_id`);

ALTER TABLE `project_tag` ADD FOREIGN KEY (`project_id`) REFERENCES `project` (`project_id`);

ALTER TABLE `project_employee` ADD FOREIGN KEY (`project_id`) REFERENCES `project` (`project_id`);

ALTER TABLE `project_employee` ADD FOREIGN KEY (`employee_id`) REFERENCES `employee` (`employee_id`);

ALTER TABLE `contact_tag` ADD FOREIGN KEY (`contact_id`) REFERENCES `contact` (`contact_id`);

ALTER TABLE `event` ADD FOREIGN KEY (`project_id`) REFERENCES `project` (`project_id`);

ALTER TABLE `event` ADD FOREIGN KEY (`contact_id`) REFERENCES `contact` (`contact_id`);

ALTER TABLE `event` ADD FOREIGN KEY (`person_id`) REFERENCES `person` (`person_id`);

ALTER TABLE `warranty` ADD FOREIGN KEY (`project_id`) REFERENCES `project` (`project_id`);

ALTER TABLE `attachment` ADD FOREIGN KEY (`ref_id`) REFERENCES `project` (`project_id`);

ALTER TABLE `attachment` ADD FOREIGN KEY (`ref_id`) REFERENCES `contact` (`contact_id`);

ALTER TABLE `attachment` ADD FOREIGN KEY (`ref_id`) REFERENCES `warranty` (`warranty_id`);

ALTER TABLE `contact_channel` ADD FOREIGN KEY (`ref_id`) REFERENCES `contact` (`contact_id`);

ALTER TABLE `contact_channel` ADD FOREIGN KEY (`ref_id`) REFERENCES `person` (`person_id`);

ALTER TABLE `project` ADD FOREIGN KEY (`project_address_id`) REFERENCES `address` (`address_id`);

ALTER TABLE `project` ADD FOREIGN KEY (`project_billing_address_id`) REFERENCES `address` (`address_id`);

ALTER TABLE `project_connection` ADD FOREIGN KEY (`project_id`) REFERENCES `project` (`project_id`);

ALTER TABLE `event` ADD FOREIGN KEY (`event_employee_id`) REFERENCES `employee` (`employee_id`);

ALTER TABLE `contact` ADD FOREIGN KEY (`billing_address_id`) REFERENCES `address` (`address_id`);

ALTER TABLE `contact` ADD FOREIGN KEY (`postal_address_id`) REFERENCES `address` (`address_id`);

ALTER TABLE `contact` ADD FOREIGN KEY (`account_receivable_id`) REFERENCES `account` (`account_id`);

ALTER TABLE `contact` ADD FOREIGN KEY (`account_payable_id`) REFERENCES `account` (`account_id`);

ALTER TABLE `project_activity` ADD FOREIGN KEY (`project_id`) REFERENCES `project` (`project_id`);

ALTER TABLE `contact_tag` ADD FOREIGN KEY (`tag_id`) REFERENCES `tag` (`tag_id`);

ALTER TABLE `project_tag` ADD FOREIGN KEY (`tag_id`) REFERENCES `tag` (`tag_id`);

ALTER TABLE `bank_account` ADD FOREIGN KEY (`contact_id`) REFERENCES `contact` (`contact_id`);

ALTER TABLE `contact` ADD FOREIGN KEY (`lead_source_id`) REFERENCES `lead_source` (`lead_source_id`);

ALTER TABLE `event` ADD FOREIGN KEY (`_event_createdby`) REFERENCES `employee` (`employee_id`);

ALTER TABLE `event` ADD FOREIGN KEY (`_event_lastupdateby`) REFERENCES `employee` (`employee_id`);

ALTER TABLE `attachment` ADD FOREIGN KEY (`_attachment_createdby`) REFERENCES `employee` (`employee_id`);

ALTER TABLE `attachment` ADD FOREIGN KEY (`_attachment_lastupdateby`) REFERENCES `employee` (`employee_id`);

ALTER TABLE `contact` ADD FOREIGN KEY (`_contact_createdby`) REFERENCES `employee` (`employee_id`);

ALTER TABLE `contact` ADD FOREIGN KEY (`_contact_lastupdateby`) REFERENCES `employee` (`employee_id`);

ALTER TABLE `project` ADD FOREIGN KEY (`_project_createdby`) REFERENCES `employee` (`employee_id`);

ALTER TABLE `project` ADD FOREIGN KEY (`_project_lastupdateby`) REFERENCES `employee` (`employee_id`);

ALTER TABLE `project_connection` ADD FOREIGN KEY (`_createdby`) REFERENCES `employee` (`employee_id`);

ALTER TABLE `project_activity` ADD FOREIGN KEY (`_project_activity_createdby`) REFERENCES `employee` (`employee_id`);

ALTER TABLE `employee` ADD FOREIGN KEY (`_employee_createdby`) REFERENCES `employee` (`employee_id`);

ALTER TABLE `employee` ADD FOREIGN KEY (`_employee_lastupdateby`) REFERENCES `employee` (`employee_id`);
