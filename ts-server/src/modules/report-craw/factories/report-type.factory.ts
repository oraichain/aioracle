import { REPORT_TYPE } from 'src/constants';
import { ChainRepository , MarketRepository } from 'src/repositories';

const ReportTypeFactory = (type) => {
    switch (type) {
        case REPORT_TYPE.CHAIN:
            return ChainRepository;
        case REPORT_TYPE.MARKET:
            return MarketRepository;
        default:
            return null;
    }
};

export {
    ReportTypeFactory
};