import React, { useEffect, useLayoutEffect, useState } from 'react';
import { Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp, NativeStackHeaderProps } from '@react-navigation/native-stack';

import {
    View,
    Text,
    Button,
    Image,
    CustomScrollView,
    Touchable,
    Switch,
    Modal,
    Login,
    useHeaderHeight,
} from '@/components';
import { useGlobalContext, useLanguageContext, useUserContext, useSystemNotify } from '@/hooks';
import { KV } from '@/types';
import { assets } from '@/assets';
import { MineApi } from '@/api';
import { Loading, Toast } from '@/services';
import { transform } from '@/utils/layout';

import { Points } from './components/points';
import { ItemLayout } from './components/item-layout';
import { styles, parisStyles } from './style';
import { ProgressBar } from '../mission/components/process-bar';

export const MineScreen: React.FC<NativeStackHeaderProps> = (props) => {
    const navigation = useNavigation<NativeStackNavigationProp<KV>>();
    const userContext = useUserContext();
    const { user, clearSign } = userContext;
    const { t } = useLanguageContext();
    const { language } = useLanguageContext();
    const { globalConfig } = useGlobalContext();
    const { status, onChange } = useSystemNotify();
    const headerHeight = useHeaderHeight();

    const [memberPointsInfo, setMemberPointsInfo] = useState<KV>();

    const firstDataList = [
        {
            icon: assets.icons.mine.lan,
            parisIcon: assets.icons.mine.lanParis,
            title: 'mine:locationAndLanguage',
            tip: 'mine:locationAndLanguageTip',
            isShow: true,
            onClick: () => {
                navigation.push('LocationAndLanguageScreen');
            },
            renderRight: () => {
                let current: any = null;
                globalConfig.divisionData.forEach((item: any) => {
                    if (item.division.code === globalConfig.division) {
                        current = item;
                    }
                });
                return (
                    <View style={styles.locationIconBox}>
                        <Image
                            source={{ uri: current?.division.icon }}
                            style={styles.locationIcon}
                        />
                    </View>
                );
            },
        },
        {
            icon: assets.icons.mine.wallet,
            parisIcon: assets.icons.mine.walletParis,
            title: 'mine:wallet',
            tip: 'mine:walletTip',
            isShow: true,
            onClick: () => {
                navigation.push('WalletScreen');
            },
        },
        {
            icon: assets.icons.mine.profile,
            parisIcon: assets.icons.mine.profileParis,
            title: 'mine:profile',
            tip: 'mine:profileTip',
            isShow: user.isLogin || false,
            onClick: () => {
                navigation.push('ProfileScreen');
            },
        },
        {
            icon: assets.icons.mine.preference,
            parisIcon: assets.icons.mine.preferenceParis,
            title: 'mine:Preferences',
            tip: 'mine:PreferencesTip',
            isShow: true,
            onClick: () => {
                navigation.push('PreferencesScreen');
            },
        },
        {
            icon: assets.icons.mine.mission,
            parisIcon: assets.icons.mine.missionParis,
            title: 'mine:missions',
            tip: 'mine:missionsTip',
            isShow: user.isLogin || false,
            onClick: () => {
                navigation.push('MissionScreen');
            },
        },
    ];

    const secondDataList = [
        {
            icon: assets.icons.mine.notification,
            title: 'mine:notifications',
            tip: 'mine:notificationsTip',
            removeRightIcon: true,
            isShow: true,
            renderRight: () => <Switch value={status} onValueChange={onChange} />,
        },
    ];
    const threeDataList = [
        {
            title: 'mine:termsConditions',
            isShow: true,
            onClick: () => {
                navigation.push('TermsConditionsScreen');
            },
        },
        {
            title: 'mine:privacyPolicy',
            isShow: true,
            onClick: () => {
                navigation.push('PrivacyPolicyScreen');
            },
        },
        {
            title: 'mine:about',
            isShow: true,
            onClick: () => {
                navigation.push('AboutScreen');
            },
        },
    ];

    useLayoutEffect(() => {
        navigation.setOptions({
            header: () => null,
        });
    }, [navigation]);

    useEffect(() => {
        user.isLogin && getData();
    }, [user.isLogin]);

    const getData = async () => {
        try {
            Loading.show();
            const res = await MineApi.getValidPoints();
            setMemberPointsInfo(res);
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
        <CustomScrollView
            headerProps={{
                ...props,
                options: {
                    headerTitle: t('mine:title'),
                    headerLeft: () => null,
                    headerRight: (props: KV) => {
                        return (
                            <Animated.View style={props.titleStyle}>
                                <Touchable
                                    style={styles.needHelpBox}
                                    onPress={() => {
                                        navigation.push('NeedHelpScreen');
                                    }}
                                >
                                    <Image
                                        source={assets.icons.common.needHelp}
                                        style={styles.needHelpIcon}
                                    />
                                </Touchable>
                            </Animated.View>
                        );
                    },
                },
            }}
            fullScreen
            scrollHeaderIndex={0}
            style={styles.container}
        >
            <View style={[styles.titleBox, { marginTop: headerHeight }]}>
                <Touchable
                    style={styles.needHelpBox}
                    onPress={() => {
                        navigation.push('NeedHelpScreen');
                    }}
                >
                    <Image source={assets.icons.common.needHelp} style={styles.needHelpIcon} />
                    <Text style={styles.needHelpText}>{t('mine:needHelp')}</Text>
                </Touchable>
                <Text style={styles.title} parisStyle={parisStyles.title}>
                    {t('mine:title')}
                </Text>
            </View>

            {user.isLogin ? <Points memberPointsInfo={memberPointsInfo} /> : <Login />}

            {user.isLogin && memberPointsInfo && !memberPointsInfo?.task?.completed && (
                <View style={styles.ProgressBarBox}>
                    <View style={styles.ProgressBarLeft}>
                        <View style={styles.ProgressBarLeftTextBox}>
                            <Text style={styles.ProgressBarLeftText}>
                                {memberPointsInfo && memberPointsInfo?.task?.displayName}
                            </Text>
                            <Image
                                source={assets.icons.points.points}
                                style={styles.ProgressBarLeftPointsIcon}
                            />
                            <Text style={styles.ProgressBarLeftPoints}>
                                {memberPointsInfo && memberPointsInfo?.task?.points}
                            </Text>
                        </View>
                        <Text style={styles.ProgressBarLeftDes}>
                            {memberPointsInfo && memberPointsInfo?.task?.description}
                        </Text>
                    </View>

                    <View style={{ flexGrow: 0 }}>
                        <ProgressBar
                            percent={
                                memberPointsInfo
                                    ? (+memberPointsInfo?.task?.satisfied /
                                          +memberPointsInfo?.task?.required) *
                                      100
                                    : 0
                            }
                            size={transform(40)}
                            borderColor={'#c0311a'}
                            unfilledColor={'#f2eceb'}
                            borderWidth={transform(5.5)}
                        >
                            <Image
                                style={{
                                    width: transform(14.5),
                                    height: transform(13.5),
                                }}
                                source={assets.icons.mine.head}
                            />
                        </ProgressBar>
                    </View>
                </View>
            )}

            <View style={styles.listBox}>
                {firstDataList.map((item: any, index: any) => {
                    return <ItemLayout data={item} key={index} />;
                })}
                <View>
                    <Text style={styles.appSettingsText}>{t('mine:appSettings')}</Text>
                    {secondDataList.map((item: any, index: any) => {
                        return <ItemLayout data={item} key={index} />;
                    })}
                </View>

                <View>
                    <Text style={styles.appSettingsText}>{t('mine:legal')}</Text>
                    {threeDataList.map((item: any, index: any) => {
                        return (
                            <ItemLayout
                                data={item}
                                key={index}
                                itemLayoutStyle={styles.threeItemLayoutStyle}
                            />
                        );
                    })}
                </View>

                {user.isLogin && (
                    <Touchable
                        onPress={() => {
                            const modal = Modal.config({
                                title: t('mine:signOutTitle'),
                                content: (
                                    <Button
                                        style={styles.logOutBtn}
                                        onPress={() => {
                                            navigation.navigate('DiscoverScreen');
                                            clearSign();
                                            modal.close();
                                        }}
                                    >
                                        <Text>{t('mine:logOut')}</Text>
                                    </Button>
                                ),
                                footer: (
                                    <Touchable
                                        style={styles.goBackBtn}
                                        onPress={() => {
                                            modal.close();
                                        }}
                                    >
                                        <Image
                                            source={assets.icons.common.arrowLeft}
                                            style={styles.goBackIcon}
                                        />
                                        <Text>{t('mine:back')}</Text>
                                    </Touchable>
                                ),
                            });
                        }}
                    >
                        <Text style={styles.signOutText}>{t('mine:signOut')}</Text>
                    </Touchable>
                )}
            </View>
        </CustomScrollView>
    );
};
