export const RULES = {
    '^pagesize': /^(5|10|20)$/,
    '^reportBusinessStatus$': /^[0-7]$/,
    '^reportStatus$': /^([0-9]|10)00[1-5]$/,
    '^.*status$': /^[01]$/,
    '^.*(level|type)$': '@natural(0,5)',
    '^.*organization.*$': '@city(true)机构',
    '^.*name$': '@cname',
    '^.*age$': '@natural(0,120)',
    '^.*id$': '@natural(1000000000000000,9999999999999999)',
    '^.*gender$': /^[0129]$/,
    '^.*ageUnit$': /^[0-4]$/,
    '^.*time$': '@datetime',
    '^.*extend$': '@csentence'
}
