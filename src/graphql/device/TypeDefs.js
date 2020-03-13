const TypeDefs = [
  `type Device {
    # Device ID
    id: String!
    # Device label
    label: String!
    # Device attributes
    attrs: [Attrs]
  }

  enum ValueType {
    NUMBER
    STRING
    BOOLEAN
    GEO
    UNDEFINED
  }

  type Attrs {
    # Attribute label
    label: String!
    # Attribute Type: number, string or boolean
    type: ValueType!
  }

  
  input FilterDeviceInput {
    # Return only devices that are named accordingly
    label: String #Prefix or suffix match
  }`,
];

module.exports = TypeDefs;
