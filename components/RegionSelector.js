import Image from "next/image";
import { motion } from "framer-motion";
import styles from "./RegionSelector.module.css";

const RegionSelector = ({ onRegionSelect }) => {
  const regions = [
    {
      name: "제주시",
      image: "/img/지역별/제주시/제주시_동지역.jpg",
      description:
        "제주도 북부 지역으로 애월읍, 조천읍, 구좌읍 등 다양한 오름들이 위치하고 있습니다",
      features: ["새별오름", "용눈이오름", "산굼부리", "금오름"],
    },
    {
      name: "서귀포시",
      image: "/img/지역별/서귀포시/서귀포시_성산일출봉.jpg",
      description:
        "제주도 남부 지역으로 성산일출봉, 한라산을 비롯한 명품 오름들이 자리하고 있습니다",
      features: ["성산일출봉", "따라비오름", "한라산", "산방산"],
    },
  ];

  return (
    <div className={styles.container}>
      <motion.div
        className={styles.header}
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className={styles.title}>제주의 오름을 만나다</h1>
        <p className={styles.subtitle}>
          360여 개의 오름이 품고 있는 제주의 이야기를 발견해보세요
        </p>
      </motion.div>

      <div className={styles.regionGrid}>
        {regions.map((region, index) => (
          <motion.div
            key={region.name}
            className={styles.regionCard}
            onClick={() => onRegionSelect(region.name)}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.6,
              delay: index * 0.2,
            }}
            whileHover={{
              scale: 1.03,
              y: -10,
              transition: { duration: 0.3 },
            }}
            whileTap={{ scale: 0.97 }}
          >
            <div className={styles.cardImage}>
              <Image
                src={region.image}
                alt={region.name}
                width={400}
                height={300}
              />
              <div className={styles.imageOverlay}>
                <h2 className={styles.regionName}>{region.name}</h2>
              </div>
            </div>

            <div className={styles.cardContent}>
              <p className={styles.regionDescription}>{region.description}</p>

              <div className={styles.featuredOreums}>
                <h4>대표 오름</h4>
                <div className={styles.oreumTags}>
                  {region.features.map((oreum) => (
                    <span key={oreum} className={styles.oreumTag}>
                      {oreum}
                    </span>
                  ))}
                </div>
              </div>

              <div className={styles.cardAction}>
                <span className={styles.actionText}>탐험하러 가기</span>
                <span className={styles.actionIcon}>→</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        className={styles.footer}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      >
        <p className={styles.footerText}>
          🌿 제주의 오름은 단순한 산이 아닙니다. 각각의 오름에는 고유한 이야기와
          생태계가 살아 숨쉬고 있어요.
        </p>
      </motion.div>
    </div>
  );
};

export default RegionSelector;
