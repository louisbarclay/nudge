# Nudge's Privacy Policy

### Effective date: 28th November 2019

Nudgeware ("us", "we", or "our") operates the Nudge browser extension ("Nudge").

Nudge sends data to Amplitude, Inc., an analytics platform (the "Analytics Platform").

This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use Nudge and the choices you have associated with that data.

Nudge's code is freely available for inspection at [https://github.com/lgwb89/nudge](https://github.com/lgwb89/nudge). Please feel free to look through the code to examine how Nudge's data sharing works in practice.

We use your data to provide and improve Nudge. By using Nudge, you agree to the collection and use of information in accordance with this policy.

### Information collection and use

We collect information for various purposes to provide and improve Nudge to you.

### The Data Sharing Option

Nudge has an option 'share anonymised data to help make Nudge better' (the "Data Sharing Option"). This option is on by default, but is presented prominently at the top of the Options page the first time you visit that page. Right-click on the Nudge icon in your Chrome menu and select Options to find this option and turn it off.

### Anonymised IDs and protection of user identity

All data that Nudge collects for a given user is under an anonymised ID (the "ID"), which is a cryptographically generated random string that persists between Chrome sessions and between different Chrome desktop browsers that the the user is signed into with the same Chrome account.

Thus, Nudge cannot identify any given user unless the user themselves provides their ID which they can find on their Options page.

Users can request deletion of their data at any time simply by sending their ID to us over email at feedback@nudgeware.io, using an anonymous email provider if needed to protect their identity.

# Types of data collected

## Data collected when Data Sharing Option is off

While the Data Sharing Option is off, Nudge will send no events or information to the Analytics Platform, with one exception:

- An event will be sent on startup of the browser with the Service installed, which will contain only the ID of the user, and whether or not their Data Sharing Option is on.

Nudge needs this to see how many active users there are.

## Data collected when Data Sharing Option is on

While the Data Sharing Option is on, Nudge will send the following events or information to the Analytics Platform, all linked to the random ID referred to above:

### **For sites that are set in the Options page as Nudge enabled sites:**

- Visits to the sites, logged by domain only (i.e. [facebook.com](http://facebook.com) instead of [facebook.com/louisbarclay](http://facebook.com/louisbarclay)), including the time and length of the visit. Nudge never sends URLs of any sites you visit to the Analytics Platform. Visiting multiple pages on the same domain consecutively is tracked by Nudge as being part of the same visit under that single domain. For instance, if you visit facebook.com/louisbarclay then [facebook.com/barackobama](http://facebook.com/barackobama) immediately afterwards, this will appear on the Analytics Platform as a single visit to facebook.com, with no information about the precise URLs that were visited.
- Nudges to the sites, for instance the time of a scroll Nudge and at what scroll level it occurred.
- This section also applies to sites that the user adds as one of their Nudge enabled sites.

### **For other sites:**

- Basic information about the type of site being visited, without any specific URLs or domains, and without any distinction at a page level.
- Sites prefaced by 'http' will be logged as 'httpSite'. A session where e.g. 16 different 'http' sites are visited consecutively, all of them on separate domains, none of them Nudge enabled sites, will be logged as a single visit to 'httpSite' on the Analytics Platform.
- Sites that are part of Google Chrome (i.e. start with 'chrome://') will be logged as 'chrome/other', with the exception of the new tab page which will be logged as 'chrome/newtab'.
- Sites that are part of the Nudge extension are the only case where full URLs are logged, for instance the Nudge Options page, which will be logged as 'nudgePage/html/pages/options.html'. This is so that we can see when the user visits pages that are part of the extension itself. However, there is an exception to this in the case of the slider page (at pages/off) which is logged without the URL that the user was intending to visit.

### **For time when Chrome is not in use, or the system is idle:**

- Basic information about when the user is not in Chrome, when the user's system is idle, and when a Nudge enabled site's tab is idle (system not yet idle but the user has not changed anything on the Nudge enabled site for a while).

### **For users of the Facebook unfollowing tool:**

- Events are sent:
  - When unfollowing is started or cancelled.
  - Every 10 successful unfollows.
  - Once unfollowing is complete.
- Additionally, the Analytics Platform is updated with the proportion of friends, pages and groups that the user is still following.
  - This can only be a figure between 0 and 1. If the figure is 0, this means the user has unfollowed all of their friends, pages and groups.
  - Nudge needs this to understand how many users are completing the process of unfollowing their News Feed.
- No other information about your Facebook account is sent to the Analytics Platform.

### **About the user generally:**

- Changes made by the user to their Nudge Options are sent as events, with the previous value and the new value.

### **Information inferred by the Analytics Platform about the user:**

- IP address.
- Device information (operating system, browser).
- Location information inferred from IP address.

## Data collected on installing Nudge

When Nudge is installed, the user will not yet have been able to set the Data Sharing Option to off. Until they do that, Nudge will send information as detailed above to the Analytics Platform, including information inferred by the Analytics Platform about the user.

## Nudge's use of the data

Nudge uses the collected data for various purposes:

- To provide and maintain Nudge.
- To notify you about changes to Nudge.
- To provide customer care and support.
- To provide analysis or valuable information so that we can improve Nudge.
- To monitor the usage of Nudge.
- To detect, prevent and address technical issues.

# Transfer of data

Your information, including Personal Data, may be transferred to — and maintained on — computers located outside of your state, province, country or other governmental jurisdiction where the data protection laws may differ than those from your jurisdiction.

If you are located outside the United Kingdom and choose to provide information to us, please note that we transfer the data, including Personal Data, to the United Kingdom and process it there.

Your consent to this Privacy Policy followed by your submission of such information represents your agreement to that transfer.

Nudge will take all steps reasonably necessary to ensure that your data is treated securely and in accordance with this Privacy Policy and no transfer of your Personal Data will take place to an organization or a country unless there are adequate controls in place including the security of your data and other personal information.

# Service Providers

We may employ third party companies and individuals to facilitate Nudge ("Service Providers"), to provide Nudge on our behalf, to perform Nudge-related services or to assist us in analyzing how our Nudge is used.

These third parties have access to your Personal Data only to perform these tasks on our behalf and are obligated not to disclose or use it for any other purpose.

# Links to other sites

Nudge may contain links to other sites that are not operated by us. If you click on a third party link, you will be directed to that third party's site. We strongly advise you to review the Privacy Policy of every site you visit.

We have no control over and assume no responsibility for the content, privacy policies or practices of any third party sites or services.

# Children's privacy

Nudge does not address anyone under the age of 18 ("Children").

We do not knowingly collect personally identifiable information from anyone under the age of 18. If you are a parent or guardian and you are aware that your Children have provided us with Personal Data, please contact us. If we become aware that we have collected Personal Data from Children without verification of parental consent, we take steps to remove that information from our servers.

# Changes to this privacy policy

We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.

We will let you know via a prominent notice on Nudge prior to the change becoming effective and update the "effective date" at the top of this Privacy Policy.

You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.

# Contact us

If you have any questions about this Privacy Policy, please contact us by email: [feedback@nudgeware.io](mailto:feedback@nudgeware.io)
