public with sharing class ShowPageController {
    
    
    @AuraEnabled(cacheable=true)
    public static List<Account> findNotes(String searchKey) {
        String key = searchKey;
        return [select Notes__c from Account where id = :key];
    }

    @AuraEnabled(cacheable=true)
    public static List<Contact> findContact(String searchKey) {
        String key = searchKey;
        return [select Support_Contact__c, Relationship__c from Contact where Email = :key];
    }



}
