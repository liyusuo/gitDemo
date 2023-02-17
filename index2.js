import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import { get } from 'lodash-es';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackHeaderProps } from '@react-navigation/native-stack';

import { Button, Touchable, Image, CustomScrollView, Modal } from '@/components';
import { PhoneCallModule } from '@/native';
import { useGlobalContext, useLanguageContext } from '@/hooks';
import { transform } from '@/utils/layout';
import { ModalRef } from '@/components/modal';
import { MapType } from '@/types';
import { MemberApi } from '@/api';
import { LinkingMaps, Loading, Toast } from '@/services';
import { assets } from '@/assets';

import { style } from './style';

export const StoreDetailScreen: React.FC<NativeStackHeaderProps> = (props) => {
    const { navigation, route } = props;

    const { t } = useLanguageContext();
    const inset = useSafeAreaInsets();

    const modalRef = useRef<ModalRef>(null);
    const {
        globalConfig: { isChinese },
    } = useGlobalContext();

    const [links, setLinks] = useState<Array<{ name: MapType; title: string }>>([]);
    const [storeInfo, setStoreInfo] = useState<any>({});
    const [showDateFlag, setShowDateFlag] = useState(false);

    const { storeId } = route.params as any;

    useLayoutEffect(() => {
        navigation.setOptions({
            header: () => null,
        });
    }, []);

    useEffect(() => {
        getStoreInfoApiFn();

        LinkingMaps.getMapsList().then((data) => {
            setLinks(data);
        });
    }, []);

    function getPOI() {
        return {
            title: get(storeInfo, 'storeMobileInfo.name'),
            content: get(storeInfo, 'addressMobileInfo.address'),
            lat: get(storeInfo, 'addressMobileInfo.longLatInfo.latitude'),
            lng: get(storeInfo, 'addressMobileInfo.longLatInfo.longitude'),
        };
    }

    function openLocation() {
        const poi = getPOI();
        if (links.length === 0) {
            return LinkingMaps.openByBrowser(isChinese, poi);
        }
        if (links.length === 1) {
            return LinkingMaps.openMapApp(links[0].name, poi);
        }
        modalRef.current?.open();
    }

    function openMap(type: MapType) {
        LinkingMaps.openMapApp(type, getPOI()).then(() => {
            modalRef.current?.close();
        });
    }

    const getStoreInfoApiFn = async () => {
        try {
            Loading.show();
            let res = await MemberApi.getStoreInfo({ id: storeId });
            setStoreInfo(res);
        } catch (e: any) {
            Toast.show({
                title: e.message,
                icon: 'error',
            });
        } finally {
            Loading.hide();
        }
    };

    return (
        <View style={style.container}>
            <CustomScrollView
                headerProps={{
                    ...props,
                    options: { headerTitle: storeInfo?.storeMobileInfo?.name },
                }}
                fullScreen
                scrollHeaderIndex={1}
            >
                <Image
                    style={style.imageStyle}
                    source={{
                        uri: storeInfo?.storeMobileInfo?.picture,
                    }}
                />
                <Text style={style.title}>{storeInfo?.storeMobileInfo?.name}</Text>
                <View style={style.box}>
                    <View style={style.commonStyle}>
                        <Image style={style.iconStyle} source={assets.icons.common.location} />
                        <Text
                            onPress={() => openLocation()}
                            style={[style.addressText, style.underline]}
                        >
                            {storeInfo?.addressMobileInfo?.address}
                        </Text>
                    </View>
                    <View style={style.commonStyle}>
                        <Image style={style.iconStyle} source={assets.icons.common.phone} />
                        <Touchable
                            onPress={() => {
                                const phone = storeInfo?.addressMobileInfo?.tel.includes('+')
                                    ? storeInfo?.addressMobileInfo?.tel.slice(1).replace(/\s*/g, '')
                                    : storeInfo?.addressMobileInfo?.tel.replace(/\s*/g, '');

                                PhoneCallModule.call(phone);
                            }}
                        >
                            <Text style={[style.phoneText, style.underline]}>
                                {storeInfo?.addressMobileInfo?.tel}
                            </Text>
                        </Touchable>
                    </View>
                    <View style={[style.commonStyle, style.dateBorder]}>
                        <Image style={style.iconStyle} source={assets.icons.common.time} />
                        <View style={style.dateContainer}>
                            <Touchable
                                onPress={() => {
                                    setShowDateFlag(!showDateFlag);
                                }}
                            >
                                <View style={style.timeContainer}>
                                    <View
                                        style={
                                            storeInfo?.businessTimeMobileInfo?.displayType ===
                                            'GRAY'
                                                ? style.mercury
                                                : style.green
                                        }
                                    ></View>
                                    <Text style={style.dateText}>
                                        {storeInfo?.businessTimeMobileInfo?.displayType ===
                                            'GRAY' && `${t('storeDetail:rest')}`}
                                        {storeInfo?.businessTimeMobileInfo?.displayType ===
                                            'GREEN_TIME' &&
                                            `${t('storeDetail:business')} ${
                                                storeInfo?.businessTimeMobileInfo?.endTime
                                            }`}
                                        {storeInfo?.businessTimeMobileInfo?.displayType ===
                                            'GREEN_NOT_TIME' &&
                                            `${storeInfo?.businessTimeMobileInfo?.week} ${storeInfo?.businessTimeMobileInfo?.startTime}-${storeInfo?.businessTimeMobileInfo?.endTime}`}
                                    </Text>
                                    <Image
                                        style={{ marginLeft: transform(8) }}
                                        source={
                                            showDateFlag
                                                ? assets.icons.common.arrowUp
                                                : assets.icons.common.arrowDown
                                        }
                                    />
                                </View>
                            </Touchable>
                            <View style={[style.dateBox, showDateFlag && style.dateBoxHeight]}>
                                <Text style={style.remark}>
                                    {storeInfo?.storeMobileInfo?.remark}
                                </Text>
                                {storeInfo?.businessTimeMobileInfo?.mobileTimes.map(
                                    (item: any, index: any) => (
                                        <View key={index} style={style.dateItem}>
                                            <Text style={style.week}>{item.week}</Text>
                                            <Text
                                                style={style.startTime}
                                            >{`${item.startTime} - ${item.endTime}`}</Text>
                                        </View>
                                    )
                                )}
                            </View>
                        </View>
                    </View>
                    <Text style={style.storeServices}>{t('storeDetail:storeServices')}</Text>
                    <Text style={style.storeServicesDes}>{t('storeDetail:storeServicesDes')}</Text>
                    {storeInfo?.specialMobileInfo?.features.map((item: any, index: any) => (
                        <View key={index} style={style.servicesItem}>
                            <Image style={style.servicesItemIcon} source={{ uri: item.icon }} />
                            <View style={style.servicesItemRight}>
                                <Text style={style.servicesItemName}>{item.name}</Text>
                                <Text style={style.servicesItemDescribe}>{item.describe}</Text>
                            </View>
                        </View>
                    ))}
                </View>
            </CustomScrollView>
            <View style={[style.btnBox, { height: transform(73) }]}>
                <Button
                    style={style.backBtnStyle}
                    type='ghost'
                    onPress={() => navigation.push('DirectoryScreen', { storeInfo })}
                >
                    {t('storeDetail:btn')}
                </Button>
            </View>

            <Modal.Popup ref={modalRef} maskClosable style={{ paddingTop: 24, paddingBottom: 32 }}>
                {links.map((i) => (
                    <Touchable
                        key={i.name}
                        style={{
                            height: 50,
                            justifyContent: 'center',
                            paddingLeft: 16,
                        }}
                        onPress={() => openMap(i.name)}
                    >
                        <Text>{i.title}</Text>
                    </Touchable>
                ))}
            </Modal.Popup>
        </View>
    );
};
