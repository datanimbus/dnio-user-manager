let defaultTimezone = require('./config').dataStackDefaultTimezone;
module.exports = [
	{
		'_id': 'Adam',
		'type': 'Management',
		'description': 'Sample Management app.',
		'defaultTimezone': defaultTimezone,
		'appCenterStyle': [{
			'theme': {
				'default': 'Light'
			},
			'bannerColor': {
				'default': true
			},
			'primaryColor': {
				'default': '#03A9F4'
			},
			'textColor': {
				'default': '#FFFFFF'
			}
		}]
	}
];