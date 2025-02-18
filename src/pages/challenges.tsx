import { FC, useState, useEffect } from 'react';
import { useAppContext } from '@/context';
import useFetch from '@/hooks/useFetch';
import Head from '@/components/head';
import Layout from '@/components/Layout';
import Active from '@/components/challenges/active';
import Complete from '@/components/challenges/complete';
import Accordion from '@/components/Accordion';
import challenge from '@/interfaces/challenge.type';
import classNames from '@/styles/tasks.module.scss';
import { CHALLENGES_URL, LOGIN_URL } from '@/constants/url';
import { useGetUserQuery } from '@/app/services/userApi';
import { skipToken } from '@reduxjs/toolkit/dist/query';

const renderCardList = (
    challengeSection: challenge['content'],
    key: string,
    userId: string
) => {
    if (key === 'Active') {
        return challengeSection.map((item) => (
            <Active content={item} key={item.id} userId={userId} />
        ));
    }
    return challengeSection.map((item) => (
        <Complete content={item} key={item.id} />
    ));
};

const Challenges: FC = () => {
    const [filteredChallenge, setFilteredChallenge] = useState<any>([]);
    const { data: user } = useGetUserQuery(skipToken);
    const { response, error, isLoading, callAPI } = useFetch(
        CHALLENGES_URL,
        {},
        false
    );
    const { state } = useAppContext();
    const { isLoading: isAuthenticating, isLoggedIn } = state;

    useEffect(() => {
        if (isLoggedIn && !Object.keys(response).length) {
            callAPI();
            if ('challenges' in response) {
                const challenges: challenge['content'] = response.challenges;
                const challengeMap: any = [];
                challengeMap.Active = challenges.filter(
                    (task) => task.is_active
                );
                challengeMap.Completed = challenges.filter(
                    (task) => !task.is_active
                );
                setFilteredChallenge(challengeMap);
            }
        }
    }, [isLoggedIn, response]);

    return (
        <Layout>
            <Head title="Challenges" />

            <div className={classNames.container}>
                {!isAuthenticating &&
                    (isLoggedIn ? (
                        isLoading ? (
                            <p>Loading...</p>
                        ) : error ? (
                            <p>Something went wrong! Please contact admin</p>
                        ) : (
                            <>
                                {Object.keys(filteredChallenge).length > 0 ? (
                                    Object.keys(filteredChallenge).map(
                                        (key) =>
                                            filteredChallenge[key].length >
                                                0 && (
                                                <Accordion
                                                    open
                                                    title={key}
                                                    key={key}
                                                >
                                                    {renderCardList(
                                                        filteredChallenge[key],
                                                        key,
                                                        user?.id ?? ''
                                                    )}
                                                </Accordion>
                                            )
                                    )
                                ) : (
                                    <p>No Challenges Found</p>
                                )}
                            </>
                        )
                    ) : (
                        <div>
                            <p>You are not Authorized</p>
                            <a
                                href={LOGIN_URL}
                                target="_blank"
                                rel="noreferrer"
                            >
                                Click here to Login
                            </a>
                        </div>
                    ))}
            </div>
        </Layout>
    );
};
export default Challenges;
