({
    invoke: function (component, event, helper) {
        var navService = component.find('navService');
        var destinationRecordId = component.get('v.destinationRecordId');
        var destinationName = component.get('v.destinationName');
        var destinationType = component.get('v.destinationType').toLowerCase();
        console.log('destinationType is: ' + destinationType);
        var destinationAction = component.get('v.destinationAction');
        var destinationActionFilter = component.get('v.destinationActionFilter');
        var relationshipName = component.get('v.relationshipName');
        var destinationUrl = component.get('v.destinationUrl');
        var defaultVals = component.get('v.defaultVals');

        //error cases:
        //destination type not present or unsupported
        //destination type is URL but no url value
        
        //destination type is url but url is not present

        //switch destination type on 
            //web: if an url is present, use it, else error
            //app: if a destinationName is present, use it, else error 
            //record: for existing records
            //object: 
                //error
                    // destinationName is not present, actions is not in supported list
                    // relationshipApiName is not presentat and actions is not in supported list
                    // relationshipApiName is present and actions not in supported list
                //if a recordId is present, assume that's the destination and look for clone, view, edit in the action. also use relationshipName if it's there
                
                //else if an objectName is present, use it, with actions home, list, and new. warn on namespace
                
            //output pageRef object string for inclusion
            //loginPage
            //knoweldgeArticle
            //NamedPage
            //CustomTab
        console.log('destinationAction is: ' + destinationAction);


        var pageReference = {
                type: '',
                attributes: {
                    objectApiName: '',
                    actionName: ''
                },
                state: {
                    filterName: ''
                }
            }
        var validActionValues = [];
        var validTypeValues = ['object','record', 'app', 'url', 'tab', 'knowledge', 'experiencepage','namedpage', 'relatedlist','cpqurl'];
        if (validTypeValues.includes(destinationType)) {
            switch (destinationType) {
                case 'object' :
                    // Open the Record page in View mode first so that it persists after the Edit Modal closes
                    console.log('entering object handler');
                    validActionValues = ['home','list','new'];
                    if (destinationAction && validActionValues.includes(destinationAction.toLowerCase())) {
                        if(destinationName) {
                            pageReference.type = 'standard__objectPage';
                            pageReference.attributes.objectApiName = destinationName;
                            pageReference.attributes.actionName = destinationAction.toLowerCase();
                            if(destinationAction.toLowerCase()=='new'){ //NEW CODE credit Jonathan Muller
                                pageReference.state.useRecordTypeCheck = 1; //NEW CODE - This is the key part that allows for selection of Record Type by the user
                            }  
                            if(destinationActionFilter) {
                                pageReference.state.filterName = destinationActionFilter;
                            }
                            if(defaultVals) {
                                
                                pageReference.state.defaultFieldValues = component.find("pageRefUtils").encodeDefaultFieldValues(JSON.parse(defaultVals));
                            }
                        } else {
                            throw new Error('Missing Destination Name. Since you have Destination Type set to Object, the Destination Name should be something like Account or MyObj__c');
                        }
                        
                    } else {
                        throw new Error("Unsupported or missing Destination Action. Currently this component supports home, list, and new");   
                    }

                break;
                case 'record' :
                    console.log('entering record section');
                    validActionValues = ['clone','edit','view'];
                    if(destinationRecordId && validActionValues.includes(destinationAction.toLowerCase())) {
                        pageReference.type = 'standard__recordPage';
                        pageReference.attributes.recordId = destinationRecordId;
                        pageReference.attributes.objectApiName = destinationName;
                        pageReference.attributes.actionName = destinationAction.toLowerCase();
                        
                    } else {
                        throw new Error('Error due to either 1) Missing RecordId. Since you have DestinationType set to record, you need to pass in a RecordId. If you want to create a new record, use a DestinationType of object instead and a DestinationAction of new or 2) You need to provide a Destination Action of edit, view or clone');
                    }
                break;

                case 'app' :
                    if(destinationName) {
                        pageReference.type = 'standard__app';
                        pageReference.attributes.appTarget = destinationName;
                        
                    } else {
                        throw new Error('Missing DestinationName. Since you have DestinationType set to app, you need to pass in either the appId (the DurableId on the AppDefinition SObject) or the appDeveloperName, which must include a namespace. Namespace is \"standard__\" for non custom apps and for custom apps that are not in managed packages, it is \"c__\"');
                    }
                break;

                case 'url' :
                    if(destinationUrl) {
                        pageReference.type = 'standard__webPage';
                        pageReference.attributes.url = destinationUrl;
                        
                    } else {
                        throw new Error('Missing DestinationUrl. Since you have DestinationType set to url, you need to pass in a valid URL');
                    }
                break;

                case 'namedpage' :
                    if(destinationName) {
                        pageReference.type = 'standard__namedPage';
                        pageReference.attributes.pageName = destinationName;                        
                    } else {
                        throw new Error('Missing DestinationName. Since you have DestinationType set to namedpage, you need to pass in a valid name. valid targets are home, chatter, today, dataAssessment, filePreview. for Community/Experience pages, set the DestinationType to experiencepage');
                    }
                break;

                case 'experiencepage' :
                    if(destinationName) {
                        pageReference.type = 'comm__namedPage';
                        pageReference.attributes.name = destinationName;                        
                    } else {
                        throw new Error('Missing DestinationName. Since you have DestinationType set to experiencepage, you need to pass in a valid name. valid targets are home, Account management, Contact support, Error, Login, Top Articles, Topic Catalog, Custom page');
                    }
                break;
                
                case 'tab' :
                    if(destinationName) {
                        pageReference.type = 'standard__navItemPage';
                        pageReference.attributes.apiName = destinationName;                        
                    } else {
                        throw new Error('Missing DestinationName. Since you have DestinationType set to tab, you need to pass in a valid name. Here, that needs to be the unique name of a CustomTab');
                    }
                break;
            
                case 'knowledge' :
                    if(destinationUrl) {
                            pageReference.type = 'standard__knowledgeArticlePage';
                            pageReference.attributes.articleType = destinationName;
                            pageReference.attributes.urlName = destinationUrl;
                    } else{
                        throw new Error('Missing DestinationUrl. Since you have DestinationType set to knowledge, you need to pass in a valid Url, representing the urlName field on the target KnowledgeArticleVersion record.');
                    }                 
                break;    
                case 'relatedlist' :
                    validActionValues = ['view'];
                    if( !( !destinationRecordId || !destinationName || !destinationAction || !relationshipName ) ) {
                        pageReference.type = 'standard__recordRelationshipPage';
                        pageReference.attributes.recordId = destinationRecordId;
                        pageReference.attributes.objectApiName = destinationName;
                        pageReference.attributes.actionName = destinationAction.toLowerCase();
                        pageReference.attributes.relationshipApiName = relationshipName;
                        
                    } else {
                        throw new Error('Missing required data. Since you have DestinationType set to relationshiplist, you need to pass in 1) a RecordId 2) a DestinationName like Case, 3) a RelationshipName like CaseComments and 4) a DestinationAction (which here has to be view) ');
                    }
                break;
                //let's say your using this component in a flow and the flow is embeded in the Saleforce CPQ edit line items screen we need to do this else we endup in loop.or any vf.
                case 'cpqurl' :
					if(destinationUrl) {
						var currentUrl = window.location.href.split(".com/")[0] + ".com/";
						window.location.href = currentUrl+destinationUrl;
						
					} else {
						throw new Error('Missing DestinationUrl. Since you have DestinationType set to url, you need to pass in a valid CPQ URL');
					}
				break;
                
            default:
                throw new Error("The code should definitely not have reached this point. Bad human.");
            
            } 

        } else {
            throw new Error("Unsupported or missing destination Type. Currently this component supports object, record, url, namedpage, tab, knowledge, relatedlist, and app");
        }
        console.log('page reference is: ' + JSON.stringify(pageReference));
        navService.navigate(pageReference);  
    } 
            
})