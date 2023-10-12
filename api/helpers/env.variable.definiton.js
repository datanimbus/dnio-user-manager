const definition = {
    '_id': {
      'type': 'String'
    },
    'label': {
      'type': 'String'
    },
    'category': {
      'type': 'String'
    },
    'value': {
      'type': 'String'
    },
    'type': {
      'type': 'String'
    },
    'description': {
      'type': 'String'
    },
    'updatedBy': {
      'type': 'String'
    },
    'isActive': {
      'type': 'Boolean',
      'default': true
    },
    'isEncrypted': {
      'type': 'Boolean',
      'default': false
    },
    'usedIn': {
      'type': 'String'
    }
  };

  module.exports.definition = definition;