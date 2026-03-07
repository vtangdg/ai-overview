package com.jaqen.sword.demo.dzg;

import java.util.*;

public class FriendSelectionOptimizer {

    // 数据结构：使用String类型表示名称
    private Map<String, Set<String>> doorToFriends;  // 门客 -> 关联的挚友集合
    private Map<String, Set<String>> friendToDoors;  // 挚友 -> 关联的门客集合
    private Map<String, String> friendToProfession;  // 挚友 -> 职业（新增）

    public FriendSelectionOptimizer() {
        this.doorToFriends = new HashMap<>();
        this.friendToDoors = new HashMap<>();
        this.friendToProfession = new HashMap<>();
    }

    /**
     * 解析关系数据
     * 新格式：挚友1,职业:门客1,门客2;挚友2:门客2,门客3;
     * 说明：职业是可选的，如果不提供职业则设置为"未知"
     */
    public void parseRelations(String data) {
        // 清空现有数据
        doorToFriends.clear();
        friendToDoors.clear();
        friendToProfession.clear();

        if (data == null || data.trim().isEmpty()) {
            System.out.println("数据为空，使用示例数据");
            generateSampleData();
            return;
        }

        System.out.println("开始解析关系数据...");
        String[] friendEntries = data.split(";");
        int entryCount = 0;

        for (String entry : friendEntries) {
            entry = entry.trim();
            if (entry.isEmpty()) continue;

            // 使用正则表达式分割挚友信息和门客列表
            // 格式：挚友名,职业:门客1,门客2
            // 或者：挚友名:门客1,门客2（没有职业）

            String[] parts;
            if (entry.contains(":")) {
                parts = entry.split(":", 2);
                if (parts.length != 2) {
                    System.out.println("格式错误，跳过: " + entry);
                    continue;
                }

                String friendInfo = parts[0].trim();  // 挚友信息（可能包含职业）
                String doorsStr = parts[1].trim();    // 门客列表

                // 解析挚友信息（可能包含职业）
                String friendName;
                String profession = "未知";

                if (friendInfo.contains(",")) {
                    String[] friendParts = friendInfo.split(",", 2);
                    friendName = friendParts[0].trim();
                    profession = friendParts.length > 1 ? friendParts[1].trim() : "未知";
                } else {
                    friendName = friendInfo;
                }

                // 解析门客列表
                String[] doorNames = doorsStr.split(",");
                Set<String> doors = new HashSet<>();

                for (String doorName : doorNames) {
                    String trimmedDoor = doorName.trim();
                    if (!trimmedDoor.isEmpty()) {
                        doors.add(trimmedDoor);

                        // 更新doorToFriends映射
                        doorToFriends.computeIfAbsent(trimmedDoor, k -> new HashSet<>())
                                .add(friendName);
                    }
                }

                // 保存挚友信息
                friendToDoors.put(friendName, doors);
                friendToProfession.put(friendName, profession);

                entryCount++;

            } else {
                System.out.println("缺少冒号分隔符，跳过: " + entry);
            }
        }

        // 确保所有门客在doorToFriends中都有记录（即使关联的挚友集合为空）
        for (String doorName : doorToFriends.keySet()) {
            // 已经通过上面的循环添加了，这里只是确保数据结构存在
        }

        System.out.println("数据解析完成！");
        System.out.println("解析成功 " + entryCount + " 个挚友条目");
        System.out.println("挚友数量: " + friendToDoors.size());
        System.out.println("门客数量: " + doorToFriends.size());

        // 打印一些统计信息
        printProfessionStats();
    }

    /**
     * 打印职业统计信息
     */
    private void printProfessionStats() {
        System.out.println("\n挚友职业分布:");
        Map<String, Integer> professionCount = new HashMap<>();
        for (String profession : friendToProfession.values()) {
            professionCount.put(profession, professionCount.getOrDefault(profession, 0) + 1);
        }

        for (Map.Entry<String, Integer> entry : professionCount.entrySet()) {
            System.out.printf("职业 '%s': %d 个挚友\n", entry.getKey(), entry.getValue());
        }
    }


    /**
     * 生成示例数据
     */
    private void generateSampleData() {
        String sampleData =
                "西王母,工:昊天上帝,东皇太一;" +
                        "女娲,农:东皇太一,蚩尤,昊天上帝;" +
                        "女魃,工:蚩尤,后羿,东皇太一,昊天上帝;" +
                        "嫦娥,侠:后羿,伏羲,蚩尤,东皇太一;" +
                        "精卫,侠:大禹,伏羲,蚩尤,后羿;" +
                        "涂山氏,工:大禹,祭师妇好,伏羲;" +
                        "王后妇好,农:吴道子,祭师妇好,牙九,大禹;" +
                        "探幽,商:小八,花木兰,寇白门,梅长苏;" +
                        "玖月,工:张起灵,鲁班,罗裁缝,小柒;" +
                        "骁宁,商:花木兰,卞玉京,李香君,项羽;" +
                        "绾绾,侠:白月初,刘昂星,寇白门,秦琼尉迟恭;" +
                        "花木兰,商:花木兰,杨戬,敖武,宗泽;" +
                        "慕姝,士:李白,董小宛,苏武,洪老邪;" +
                        "司棠,商:李香君,甄嬛,郑和,小柒;" +
                        "玉露,农:葫芦仙人,杜康,罗裁缝,马湘兰;" +
                        "昭阳,工:小鱼儿,小柒,宋徽宗,冯蜜儿;" +
                        "何曦,侠:刘昂星,张起灵,蔡京,方火头;" +
                        "盗姑,侠:刘昂星,小柒,吕布,秦琼尉迟恭;" +
                        "虞姬,士:白月初,董小宛,项羽,哪吒;" +
                        "周梅丽,侠:刘昂星,葫芦仙人,雷恩,四郎;" +
                        "行岚,商:甄嬛,秦始皇,哪吒,沈万三,小八;" +
                        "极昼,工:李白,寇白门,敖武,梅长苏;" +
                        "马湘兰,士:马湘兰,蔡京,百戏圣刀,小鱼儿;" +
                        "云织,农:兰飞鸿,卞玉京,解鲁,小鱼儿;" +
                        "新娘,商:冷二皮,丁戏人,方火头,秦始皇,甄嬛,花木兰;" +
                        "比比东,士:杨戬,梅长苏,四郎,毕昇,小舞;" +
                        "徽茵,工:白月初,马湘兰,蔡京,孙武,郑和;" +
                        "隐娘,农:甄嬛,张起灵,百戏圣刀,高渐离;" +
                        "涂山红红,士:白月初,向恩,石敢当,卞玉京;" +
                        "凝音,工:白月初,宗泽,沈万三,百戏圣刀;" +
                        "器灵,侠:兰飞鸿,张三丰,敦煌匠神,秦琼尉迟恭,小八;" +
                        "青凝,士:李白,吴道子,鲁班,蔡京,郑和;" +
                        "甄嬛,商:甄嬛,高渐离,观星师,解鲁,刘昂星;" +
                        "沈眉庄,农:甄嬛,李香君,李神手,雷恩,曾巩;" +
                        "邀影,侠:葫芦仙人,丁戏人,李神手,周瑜;" +
                        "千仞雪,士:杨戬,张三丰,牙九,镇屠夫,小舞;" +
                        "墨璃,商:张起灵,董小宛,洪老邪,哪吒,小柒;" +
                        "玉兔,工:梅长苏,马湘兰,向恩,秦琼尉迟恭;" +
                        "极夜,农:李白,卞玉京,解鲁,项羽;" +
                        "吴邪,侠:张起灵,孙膑,雷恩,敖武;" +
                        "市舶使,侠:葫芦仙人,李香君,吕布,秦琼尉迟恭,小八;" +
                        "霓凰郡主,士:梅长苏,杜康,毕昇,寇白门;" +
                        "渔歌,侠:杨戬,宗泽,孙武,小舞,小柒;" +
                        "萝,工:兰飞鸿,鲁班,冯蜜儿,四郎,小柒;" +
                        "秋萤,商:小鱼儿,秦始皇,严先生,孙武;" +
                        "南宫婉,商:李白,董小宛,宋徽宗;" +
                        "花无缺,农:小鱼儿,冷二皮,马湘兰,四郎;" +
                        "荒野铃兰,商:伏羲,苏武,秦始皇,方火头;" +
                        "堇书,士:寇白门,葫芦仙人,吴道子,秦琼尉迟恭;" +
                        "手工少女,工:宗泽,石敢当,欧冶子,梅长苏;" +
                        "紫玉,农:后羿,罗裁缝,卞玉京,鲁班;" +
                        "小鹿女,士:丁戏人,敦煌匠神,武石仁,郑厨子,哪吒;" +
                        "捉鬼师,工:董小宛,活阎王,高渐离,李白;" +
                        "小舞,侠:杨戬,张三丰,李香君,小舞;" +
                        "小蝴蝶,商:葫芦仙人,沈万三,孙膑,敖武,花木兰;" +
                        "牛郎,农:方火头,冯蜜儿,向恩;" +
                        "织女,工:李神手,冷二皮,周瑜,敖武;" +
                        "花郎,工:丁戏人,洪老邪,四郎;" +
                        "巫女,侠:严先生,马湘兰,哪吒;" +
                        "西湖船娘,农:吴道子,秦剑仙,镇屠夫;" +
                        "古国公主,农:孙膑,沈万三,兰飞鸿,孙武;" +
                        "小木匠,工:宋徽宗,曹铁匠,罗裁缝,吕布;" +
                        "糖苹果,商:宗泽,董小宛,兰飞鸿,敖武,刘昂星,项羽;" +
                        "采诗官,士:李香君,高渐离,宋江,小鱼儿;" +
                        "狐妖掌柜,商:杜康,毕昇,敦煌匠神;" +
                        "灵夜猫女,工:欧冶子,苏武,雷恩,李白,小八;" +
                        "驯马师,农:马湘兰,石敢当,解鲁,吕布;" +
                        "花艺师,工:鲁班,高渐离,向恩,哪吒;" +
                        "驿使,士:严先生,洪老邪,敦煌匠神,梅长苏;" +
                        "苗疆圣女,农:冯蜜儿,镇屠夫,祭师妇好,杨戬,甄嬛,小舞;" +
                        "驯鹰,商:孙膑,宗泽,大禹,兰飞鸿,白月初;" +
                        "小师妹,侠:神算子,罗裁缝,观星师,葫芦仙人,张起灵;" +
                        "捕快,侠:牙九,张三丰,周瑜,滚海蛟,项羽;" +
                        "李香君,农:李香君,石敢当,宋江,杨戬,小舞;" +
                        "董小宛,工:董小宛,祭师妇好,蔡京,秦始皇,白月初;" +
                        "卞玉京,商:卞玉京,观星师,活阎王,滚海蛟,花木兰;" +
                        "寇白门,侠:寇白门,观星师,宋徽宗,郑和;" +
                        "新娘之妹,工:鲁班,活阎王,雷恩,吕布,张起灵;" +
                        "红娘子,侠:严小二,钱财主;" +
                        "密探,侠:邢护卫,寇白门;" +
                        "李师师,商:葛郎中,沈万三,镇屠夫,宋徽宗;" +
                        "浪子,侠:镇屠夫,解鲁;" +
                        "少将军,士:李神手,百戏圣刀;" +
                        "医师,士:冷二皮,欧冶子;" +
                        "郡主,士:吴道子,毕昇;" +
                        "棋士,士:严小二,李神手;" +
                        "元宵姑娘,工:罗裁缝,冯蜜儿;" +
                        "西域女子,商:云游人,丁戏人;" +
                        "小乞丐,农:方火头,洪老邪;" +
                        "嬷嬷,农:武镖师,杜康;" +
                        "将门女子,侠:武镖师,严先生;" +
                        "琵琶女,商:田诗人,秦剑仙;" +
                        "豆腐女,工:落孙山,唐葫芦;" +
                        "戏子,商:刘戏子,武石仁;" +
                        "蹴鞠女,工:蔡渔夫,皮影戏人;" +
                        "蒙琪儿,侠:朱大亮,沈万三;" +
                        "草原女孩,侠:费机关,苏武;" +
                        "舞女,士:何雅士,邢护卫;" +
                        "采药女,农:庄更夫,曹铁匠;" +
                        "猎人,侠:姚仵作,赵猎户;" +
                        "静庵,士:郑厨子,牙九;" +
                        "丫鬟,农:胡乞丐,刘四郎;" +
                        "小师姐,士:贾猴子,李剑痴;" +
                        "书香女,士:柳捕快,万金牙;" +
                        "剑舞者,侠:梁歪七,钱财主;" +
                        "卖伞女,商:祝货郎,张老伯;" +
                        "秀娘,农:郑果农,黎蛊师,孙膑,卞玉京;" +
                        "针线女,农:康茶师,牛符师;";

        parseRelations(sampleData);
    }

    /**
     * 方法1：基于门客覆盖重叠度的贪心算法
     */
    public List<String> selectFriendsByOverlapGreedy(int k) {
        System.out.println("\n=== 基于重叠度的贪心算法选择 " + k + " 个挚友 ===");

        Set<String> selectedFriends = new HashSet<>();
        Set<String> remainingFriends = new HashSet<>(friendToDoors.keySet());
        Set<String> coveredDoors = new HashSet<>();

        // 第一次选择：选择覆盖门客数最多的挚友
        String firstFriend = findFriendWithMaxCoverage(remainingFriends);
        selectedFriends.add(firstFriend);
        remainingFriends.remove(firstFriend);
        coveredDoors.addAll(friendToDoors.get(firstFriend));

        System.out.println("1. 初始选择挚友: " + firstFriend + "，覆盖 " +
                friendToDoors.get(firstFriend).size() + " 个门客");

        // 后续选择：选择与已选挚友门客重叠度最高的挚友
        for (int i = 1; i < k; i++) {
            String bestFriend = null;
            double bestOverlapScore = -1;

            for (String friend : remainingFriends) {
                Set<String> friendDoors = friendToDoors.get(friend);

                // 计算重叠度分数
                double overlapScore = calculateOverlapScore(friendDoors, coveredDoors, selectedFriends);

                if (overlapScore > bestOverlapScore) {
                    bestOverlapScore = overlapScore;
                    bestFriend = friend;
                }
            }

            if (bestFriend != null) {
                selectedFriends.add(bestFriend);
                remainingFriends.remove(bestFriend);
                coveredDoors.addAll(friendToDoors.get(bestFriend));

                System.out.println((i+1) + ". 选择挚友: " + bestFriend +
                        "，重叠度分数: " + String.format("%.3f", bestOverlapScore));
            }
        }

        List<String> result = new ArrayList<>(selectedFriends);
        Collections.sort(result);
        return result;
    }

    /**
     * 计算重叠度分数
     */
    private double calculateOverlapScore(Set<String> friendDoors,
                                         Set<String> coveredDoors,
                                         Set<String> selectedFriends) {
        // 1. 与已覆盖门客的重叠比例
        Set<String> overlap = new HashSet<>(friendDoors);
        overlap.retainAll(coveredDoors);
        double overlapRatio = coveredDoors.isEmpty() ? 0 :
                (double) overlap.size() / Math.min(friendDoors.size(), coveredDoors.size());

        // 2. 与已选挚友的协同度（共享门客数）
        double synergyScore = 0;
        for (String selectedFriend : selectedFriends) {
            Set<String> selectedFriendDoors = friendToDoors.get(selectedFriend);
            Set<String> sharedDoors = new HashSet<>(friendDoors);
            sharedDoors.retainAll(selectedFriendDoors);
            synergyScore += sharedDoors.size();
        }
        synergyScore = synergyScore / (selectedFriends.size() * friendDoors.size());

        // 3. 综合分数
        return 0.6 * overlapRatio + 0.4 * synergyScore;
    }

    /**
     * 方法2：基于Jaccard相似度的聚类算法
     */
    public List<String> selectFriendsByJaccardClustering(int k) {
        System.out.println("\n=== 基于Jaccard相似度的聚类算法 ===");

        // 计算所有挚友对之间的Jaccard相似度
        Map<String, Map<String, Double>> similarityMatrix = calculateJaccardSimilarity();

        // 使用层次聚类思想选择挚友
        Set<String> selectedFriends = new HashSet<>();

        // 找到相似度最高的挚友对作为种子
        double maxSimilarity = -1;
        String friend1 = null, friend2 = null;

        for (String f1 : friendToDoors.keySet()) {
            Map<String, Double> similarities = similarityMatrix.get(f1);
            if (similarities == null) continue;

            for (String f2 : similarities.keySet()) {
                if (f1.equals(f2)) continue;

                double similarity = similarities.get(f2);
                if (similarity > maxSimilarity) {
                    maxSimilarity = similarity;
                    friend1 = f1;
                    friend2 = f2;
                }
            }
        }

        if (friend1 != null && friend2 != null) {
            selectedFriends.add(friend1);
            selectedFriends.add(friend2);
            System.out.println("初始核心对: " + friend1 + " 和 " + friend2 +
                    "，Jaccard相似度: " + String.format("%.3f", maxSimilarity));
        }

        // 逐步添加与已选集合平均相似度最高的挚友
        while (selectedFriends.size() < k) {
            String bestFriend = null;
            double bestAvgSimilarity = -1;

            for (String friend : friendToDoors.keySet()) {
                if (selectedFriends.contains(friend)) continue;

                double totalSimilarity = 0;
                int count = 0;

                for (String selectedFriend : selectedFriends) {
                    Double similarity = getSimilarity(similarityMatrix, friend, selectedFriend);
                    if (similarity != null) {
                        totalSimilarity += similarity;
                        count++;
                    }
                }

                if (count > 0) {
                    double avgSimilarity = totalSimilarity / count;
                    if (avgSimilarity > bestAvgSimilarity) {
                        bestAvgSimilarity = avgSimilarity;
                        bestFriend = friend;
                    }
                }
            }

            if (bestFriend != null) {
                selectedFriends.add(bestFriend);
                System.out.println("添加挚友: " + bestFriend +
                        "，平均相似度: " + String.format("%.3f", bestAvgSimilarity));
            }
        }

        List<String> result = new ArrayList<>(selectedFriends);
        Collections.sort(result);
        return result;
    }

    /**
     * 计算Jaccard相似度矩阵
     */
    private Map<String, Map<String, Double>> calculateJaccardSimilarity() {
        Map<String, Map<String, Double>> similarity = new HashMap<>();

        for (String friend1 : friendToDoors.keySet()) {
            Map<String, Double> row = new HashMap<>();
            Set<String> doors1 = friendToDoors.get(friend1);

            for (String friend2 : friendToDoors.keySet()) {
                if (friend1.equals(friend2)) {
                    row.put(friend2, 1.0);
                    continue;
                }

                Set<String> doors2 = friendToDoors.get(friend2);
                Set<String> intersection = new HashSet<>(doors1);
                intersection.retainAll(doors2);

                Set<String> union = new HashSet<>(doors1);
                union.addAll(doors2);

                double jaccard = union.isEmpty() ? 0 :
                        (double) intersection.size() / union.size();
                row.put(friend2, jaccard);
            }

            similarity.put(friend1, row);
        }

        return similarity;
    }

    private Double getSimilarity(Map<String, Map<String, Double>> similarityMatrix,
                                 String friend1, String friend2) {
        Map<String, Double> row = similarityMatrix.get(friend1);
        return row != null ? row.get(friend2) : null;
    }

    /**
     * 方法3：基于门客被覆盖次数的优化
     */
    public List<String> selectFriendsByDoorCoverage(int k) {
        System.out.println("\n=== 基于门客被覆盖次数的优化算法 ===");

        // 统计每个门客当前被选中的挚友覆盖次数
        Map<String, Integer> doorCoverageCount = new HashMap<>();
        Set<String> selectedFriends = new HashSet<>();

        // 初始化门客覆盖次数
        for (String door : doorToFriends.keySet()) {
            doorCoverageCount.put(door, 0);
        }

        // 第一次选择：覆盖门客数最多的挚友
        String firstFriend = findFriendWithMaxCoverage(new HashSet<>(friendToDoors.keySet()));
        selectedFriends.add(firstFriend);

        // 更新门客覆盖次数
        for (String door : friendToDoors.get(firstFriend)) {
            doorCoverageCount.put(door, doorCoverageCount.get(door) + 1);
        }

        System.out.println("1. 初始选择挚友: " + firstFriend);

        // 后续选择：优先选择能增加门客覆盖次数的挚友
        for (int i = 1; i < k; i++) {
            String bestFriend = null;
            double bestScore = -1;

            for (String friend : friendToDoors.keySet()) {
                if (selectedFriends.contains(friend)) continue;

                Set<String> friendDoors = friendToDoors.get(friend);
                double score = calculateCoverageScore(friendDoors, doorCoverageCount);

                if (score > bestScore) {
                    bestScore = score;
                    bestFriend = friend;
                }
            }

            if (bestFriend != null) {
                selectedFriends.add(bestFriend);

                // 更新门客覆盖次数
                for (String door : friendToDoors.get(bestFriend)) {
                    doorCoverageCount.put(door, doorCoverageCount.get(door) + 1);
                }

                System.out.println((i+1) + ". 选择挚友: " + bestFriend +
                        "，覆盖度分数: " + String.format("%.3f", bestScore));
            }
        }

        // 分析结果
        analyzeCoverageDistribution(selectedFriends, doorCoverageCount);

        List<String> result = new ArrayList<>(selectedFriends);
        Collections.sort(result);
        return result;
    }

    /**
     * 计算覆盖度分数
     */
    private double calculateCoverageScore(Set<String> friendDoors, Map<String, Integer> doorCoverageCount) {
        double score = 0;
        double doorWeightSum = 0;

        for (String door : friendDoors) {
            Integer coverageCount = doorCoverageCount.get(door);
            if (coverageCount == null) {
                coverageCount = 0;
            }

            // 当前覆盖次数越少，新增覆盖的价值越高
            // 使用指数衰减权重：1/(1+coverageCount^2)
            double weight = 1.0 / (1 + Math.pow(coverageCount, 1.5));
            score += weight;
            doorWeightSum += 1.0;
        }

        // 归一化处理
        return doorWeightSum > 0 ? score / doorWeightSum : 0;
    }

    /**
     * 方法4：整数规划近似算法（贪心+局部搜索）
     */
    public List<String> selectFriendsByLocalSearch(int k, int maxIterations) {
        System.out.println("\n=== 局部搜索优化算法 ===");

        // 使用贪心算法得到初始解
        List<String> currentSolution = selectFriendsByDoorCoverage(k);
        double currentScore = evaluateSolution(currentSolution);

        System.out.println("初始解分数: " + String.format("%.3f", currentScore));

        // 局部搜索优化
        Random random = new Random(42);
        List<String> allFriends = new ArrayList<>(friendToDoors.keySet());

        for (int iter = 0; iter < maxIterations; iter++) {
            boolean improved = false;

            // 尝试随机交换挚友
            for (int attempt = 0; attempt < 50; attempt++) {
                int idx = random.nextInt(currentSolution.size());
                String oldFriend = currentSolution.get(idx);

                // 随机选择一个新的挚友（不在当前解中）
                String newFriend;
                do {
                    newFriend = allFriends.get(random.nextInt(allFriends.size()));
                } while (currentSolution.contains(newFriend));

                List<String> newSolution = new ArrayList<>(currentSolution);
                newSolution.set(idx, newFriend);

                double newScore = evaluateSolution(newSolution);

                if (newScore > currentScore) {
                    currentSolution = newSolution;
                    currentScore = newScore;
                    improved = true;
                    System.out.println("迭代 " + (iter+1) + ": 改进解，新分数: " +
                            String.format("%.3f", newScore));
                    break;
                }
            }

            if (!improved) break; // 无法继续改进
        }

        Collections.sort(currentSolution);
        return currentSolution;
    }

    /**
     * 评估解决方案的质量
     */
    private double evaluateSolution(List<String> selectedFriends) {
        if (selectedFriends.isEmpty()) return 0;

        Map<String, Integer> doorCoverage = new HashMap<>();

        // 初始化门客覆盖次数
        for (String door : doorToFriends.keySet()) {
            doorCoverage.put(door, 0);
        }

        // 统计每个门客被选中的挚友覆盖的次数
        for (String friend : selectedFriends) {
            for (String door : friendToDoors.get(friend)) {
                doorCoverage.put(door, doorCoverage.get(door) + 1);
            }
        }

        // 计算平均覆盖次数和覆盖门客比例
        double totalCoverage = 0;
        int coveredDoors = 0;

        for (int count : doorCoverage.values()) {
            totalCoverage += count;
            if (count > 0) coveredDoors++;
        }

        if (coveredDoors == 0) return 0;

        double avgCoverage = totalCoverage / coveredDoors;
        double coverageRatio = (double) coveredDoors / doorCoverage.size();

        // 计算重叠度指标
        double overlapScore = calculateOverlapIndex(selectedFriends);

        // 综合分数：加权平均
        return 0.5 * avgCoverage + 0.3 * coverageRatio + 0.2 * overlapScore;
    }

    /**
     * 辅助方法：找到覆盖门客数最多的挚友
     */
    private String findFriendWithMaxCoverage(Set<String> candidateFriends) {
        int maxCoverage = -1;
        String bestFriend = null;

        for (String friend : candidateFriends) {
            int coverage = friendToDoors.get(friend).size();
            if (coverage > maxCoverage) {
                maxCoverage = coverage;
                bestFriend = friend;
            }
        }

        return bestFriend;
    }

    /**
     * 分析覆盖分布
     */
    private void analyzeCoverageDistribution(Set<String> selectedFriends, Map<String, Integer> doorCoverageCount) {
        System.out.println("\n覆盖分布分析:");

        // 统计不同覆盖次数的门客数量
        Map<Integer, Integer> coverageDistribution = new HashMap<>();
        int maxCoverage = 0;

        for (int count : doorCoverageCount.values()) {
            coverageDistribution.put(count, coverageDistribution.getOrDefault(count, 0) + 1);
            maxCoverage = Math.max(maxCoverage, count);
        }

        // 打印分布
        for (int i = 0; i <= maxCoverage; i++) {
            if (coverageDistribution.containsKey(i)) {
                System.out.println("被 " + i + " 个挚友覆盖的门客: " +
                        coverageDistribution.get(i) + " 个");
            }
        }

        // 计算平均覆盖次数
        double totalCoverage = 0;
        int coveredDoors = 0;

        for (int count : doorCoverageCount.values()) {
            if (count > 0) {
                totalCoverage += count;
                coveredDoors++;
            }
        }

        System.out.println("\n统计结果:");
        System.out.println("覆盖门客比例: " + coveredDoors + "/" + doorCoverageCount.size() +
                " (" + String.format("%.1f", 100.0 * coveredDoors / doorCoverageCount.size()) + "%)");
        System.out.println("平均覆盖次数: " + String.format("%.2f", totalCoverage / coveredDoors));

        // 计算重叠度指标
        double overlapScore = calculateOverlapIndex(new ArrayList<>(selectedFriends));
        System.out.println("重叠度指数: " + String.format("%.3f", overlapScore));
    }

    /**
     * 计算重叠度指数
     */
    private double calculateOverlapIndex(List<String> selectedFriends) {
        if (selectedFriends.size() < 2) return 0;

        int actualSharedPairs = 0;
        int maxPossiblePairs = 0;

        for (int i = 0; i < selectedFriends.size(); i++) {
            for (int j = i + 1; j < selectedFriends.size(); j++) {
                Set<String> doorsI = friendToDoors.get(selectedFriends.get(i));
                Set<String> doorsJ = friendToDoors.get(selectedFriends.get(j));

                Set<String> intersection = new HashSet<>(doorsI);
                intersection.retainAll(doorsJ);

                if (!intersection.isEmpty()) {
                    actualSharedPairs++;
                }
                maxPossiblePairs++;
            }
        }

        return maxPossiblePairs > 0 ? (double) actualSharedPairs / maxPossiblePairs : 0;
    }

    /**
     * 混合方法：综合多种算法结果
     */
    public List<String> hybridSelection(int k) {
        System.out.println("\n" + "=".repeat(60));
        System.out.println("混合方法：综合评估多种算法");
        System.out.println("=".repeat(60));

        // 运行所有算法
        System.out.println("\n执行重叠度贪心算法...");
        List<String> result1 = selectFriendsByOverlapGreedy(k);
        double score1 = evaluateSolution(result1);

        System.out.println("\n执行Jaccard聚类算法...");
        List<String> result2 = selectFriendsByJaccardClustering(k);
        double score2 = evaluateSolution(result2);

        System.out.println("\n执行门客覆盖算法...");
        List<String> result3 = selectFriendsByDoorCoverage(k);
        double score3 = evaluateSolution(result3);

        System.out.println("\n执行局部搜索算法...");
        List<String> result4 = selectFriendsByLocalSearch(k, 100);
        double score4 = evaluateSolution(result4);

        // 比较结果
        System.out.println("\n" + "=".repeat(40));
        System.out.println("算法性能比较");
        System.out.println("=".repeat(40));
        System.out.printf("重叠度贪心算法分数: %.3f\n", score1);
        System.out.printf("Jaccard聚类算法分数: %.3f\n", score2);
        System.out.printf("门客覆盖算法分数: %.3f\n", score3);
        System.out.printf("局部搜索算法分数: %.3f\n", score4);

        // 选择最佳结果
        Map<Double, List<String>> scoreMap = new TreeMap<>(Collections.reverseOrder());
        scoreMap.put(score1, result1);
        scoreMap.put(score2, result2);
        scoreMap.put(score3, result3);
        scoreMap.put(score4, result4);

        List<String> bestResult = scoreMap.values().iterator().next();
        double bestScore = scoreMap.keySet().iterator().next();

        System.out.println("\n最佳分数: " + String.format("%.3f", bestScore));
        System.out.println("选中的挚友: " + bestResult);

        return bestResult;
    }

    /**
     * 详细分析选中的挚友
     */
    public void analyzeSelectedFriends(List<String> selectedFriends) {
        System.out.println("\n" + "=".repeat(60));
        System.out.println("选中挚友详细分析");
        System.out.println("=".repeat(60));

        System.out.println("\n挚友详情:");
        for (String friend : selectedFriends) {
            Set<String> doors = friendToDoors.get(friend);
            System.out.printf("挚友 %-8s: 覆盖 %2d 个门客: %s\n",
                    friend, doors.size(), truncateList(doors, 5));
        }

        // 分析协同关系
        System.out.println("\n协同关系分析（共享门客数）:");
        Map<String, Map<String, Integer>> sharedMatrix = new HashMap<>();

        for (int i = 0; i < selectedFriends.size(); i++) {
            String friend1 = selectedFriends.get(i);
            for (int j = i + 1; j < selectedFriends.size(); j++) {
                String friend2 = selectedFriends.get(j);

                Set<String> doors1 = friendToDoors.get(friend1);
                Set<String> doors2 = friendToDoors.get(friend2);

                Set<String> intersection = new HashSet<>(doors1);
                intersection.retainAll(doors2);

                if (!intersection.isEmpty()) {
                    System.out.printf("%-8s 和 %-8s 共享 %2d 个门客: %s\n",
                            friend1, friend2, intersection.size(), truncateList(intersection, 3));
                }
            }
        }

        // 推荐核心门客（被最多挚友覆盖的门客）
        System.out.println("\n推荐重点培养的门客（按被覆盖次数排序）:");
        Map<String, Integer> doorCoverageMap = new HashMap<>();

        for (String friend : selectedFriends) {
            for (String door : friendToDoors.get(friend)) {
                doorCoverageMap.put(door, doorCoverageMap.getOrDefault(door, 0) + 1);
            }
        }

        // 排序门客
        List<Map.Entry<String, Integer>> sortedDoors = new ArrayList<>(doorCoverageMap.entrySet());
        sortedDoors.sort((a, b) -> b.getValue() - a.getValue());

        int topN = Math.min(15, sortedDoors.size());
        for (int i = 0; i < topN; i++) {
            Map.Entry<String, Integer> entry = sortedDoors.get(i);
            // 找出覆盖该门客的挚友
            Set<String> coveringFriends = new HashSet<>();
            for (String friend : selectedFriends) {
                if (friendToDoors.get(friend).contains(entry.getKey())) {
                    coveringFriends.add(friend);
                }
            }

            System.out.printf("门客 %-8s: 被 %2d 个挚友覆盖 [%s]\n",
                    entry.getKey(), entry.getValue(), truncateList(coveringFriends, 3));
        }
    }

    /**
     * 截断集合显示
     */
    private String truncateList(Set<String> set, int maxItems) {
        List<String> list = new ArrayList<>(set);
        if (list.size() <= maxItems) {
            return String.join(", ", list);
        } else {
            return String.join(", ", list.subList(0, maxItems)) +
                    ", ... (共" + list.size() + "个)";
        }
    }

    /**
     * 打印关系网络统计
     */
    public void printNetworkStats() {
        System.out.println("\n" + "=".repeat(60));
        System.out.println("关系网络统计信息");
        System.out.println("=".repeat(60));

        System.out.println("挚友总数: " + friendToDoors.size());
        System.out.println("门客总数: " + doorToFriends.size());

        // 统计挚友覆盖门客数分布
        System.out.println("\n挚友覆盖门客数分布:");
        Map<Integer, Integer> friendCoverageDist = new TreeMap<>();
        for (Set<String> doors : friendToDoors.values()) {
            int size = doors.size();
            friendCoverageDist.put(size, friendCoverageDist.getOrDefault(size, 0) + 1);
        }
        for (Map.Entry<Integer, Integer> entry : friendCoverageDist.entrySet()) {
            System.out.printf("覆盖 %2d 个门客的挚友: %2d 个\n", entry.getKey(), entry.getValue());
        }

        // 统计门客关联挚友数分布
        System.out.println("\n门客关联挚友数分布:");
        Map<Integer, Integer> doorRelationDist = new TreeMap<>();
        for (Set<String> friends : doorToFriends.values()) {
            int size = friends.size();
            doorRelationDist.put(size, doorRelationDist.getOrDefault(size, 0) + 1);
        }
        for (Map.Entry<Integer, Integer> entry : doorRelationDist.entrySet()) {
            System.out.printf("关联 %2d 个挚友的门客: %2d 个\n", entry.getKey(), entry.getValue());
        }
    }

    /**
     * 从控制台读取数据
     */
    public static String readInputData() {
        System.out.println("请输入门客-挚友关系数据（格式：挚友1:门客1,门客2;挚友2:门客2,门客3;）");
        System.out.println("直接回车使用示例数据:");

        try {
            Scanner scanner = new Scanner(System.in);
            String input = scanner.nextLine();
            if (input.trim().isEmpty()) {
                return null;
            }
            return input;
        } catch (Exception e) {
            System.out.println("读取输入失败，使用示例数据");
            return null;
        }
    }

    public static void main(String[] args) {
        // 创建优化器
        FriendSelectionOptimizer optimizer = new FriendSelectionOptimizer();

        // 读取数据（可以替换为实际数据）
        String inputData = readInputData();
        optimizer.parseRelations(inputData);

        // 打印网络统计
        optimizer.printNetworkStats();

        // 使用混合方法选择15个挚友
        List<String> selectedFriends = optimizer.hybridSelection(15);

        // 详细分析
        optimizer.analyzeSelectedFriends(selectedFriends);

        System.out.println("\n" + "=".repeat(60));
        System.out.println("培养策略建议");
        System.out.println("=".repeat(60));
        System.out.println("1. 优先培养选中的15个挚友，提升他们对核心门客的加成");
        System.out.println("2. 重点培养被多个挚友覆盖的核心门客，最大化协同效应");
        System.out.println("3. 保持挚友培养平衡，避免个别挚友等级过低");
        System.out.println("4. 定期重新评估，随着游戏更新调整培养策略");
        System.out.println("5. 考虑挚友的获取难度和培养成本，灵活调整");
    }
}