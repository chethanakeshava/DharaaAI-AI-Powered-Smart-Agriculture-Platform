import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Users,
  MessageCircle,
  ThumbsUp,
  Search,
  Plus,
  TrendingUp,
  Award,
  Leaf,
  Calendar,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useApp } from "@/context/AppContext";
import { CreateCommunityWidget } from "@/components/community/CreateCommunityWidget";
import { FeedbackWidget } from "@/components/community/FeedbackWidget";
import { LocalChallenges } from "@/components/community/LocalChallenges";
import { CreatePostForm } from "@/components/community/CreatePostForm";
import { DiscussionDetail } from "@/components/community/DiscussionDetail";

interface Reply {
  id: string;
  author: string;
  avatar: string;
  content: string;
  timestamp: string;
  likes: number;
}

interface Discussion {
  id: number;
  title: string;
  category: string;
  author: string;
  avatar: string;
  replies: number;
  views: number;
  likes: number;
  dislikes: number;
  lastActive: string;
  preview: string;
  content: string;
}

interface Category {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  discussionCount: number;
  memberCount: number;
}

export default function CommunityForum() {
  const { communities, posts, feedback, fetchCommunities, fetchPosts, fetchFeedback, user } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [userLikedDiscussions, setUserLikedDiscussions] = useState<Set<number>>(new Set());
  const [userDislikedDiscussions, setUserDislikedDiscussions] = useState<Set<number>>(new Set());
  const [discussionLikeCounts, setDiscussionLikeCounts] = useState<Record<number, number>>({});
  const [discussionDislikeCounts, setDiscussionDislikeCounts] = useState<Record<number, number>>({});
  const [showPostForm, setShowPostForm] = useState<string | null>(null);
  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");
  const [selectedDiscussion, setSelectedDiscussion] = useState<number | null>(null);
  const [discussionRepliesData, setDiscussionRepliesData] = useState<Record<number, Reply[]>>({});

  useEffect(() => {
    fetchCommunities();
    fetchPosts();
    fetchFeedback();
  }, []);

  const handleLike = (discussionId: number) => {
    if (!user) {
      toast.error("Please log in to like discussions");
      return;
    }

    const discussion = discussions.find((d) => d.id === discussionId);
    const originalLikeCount = discussion?.likes || 0;

    if (userLikedDiscussions.has(discussionId)) {
      // Undo like - decrement count by 1
      setUserLikedDiscussions((prev) => {
        const newSet = new Set(prev);
        newSet.delete(discussionId);
        return newSet;
      });
      setDiscussionLikeCounts((prev) => ({
        ...prev,
        [discussionId]: Math.max(0, (prev[discussionId] || originalLikeCount) - 1),
      }));
      toast.success("Like removed");
    } else {
      // Add like - increment count by 1
      setUserLikedDiscussions((prev) => new Set(prev).add(discussionId));
      setDiscussionLikeCounts((prev) => ({
        ...prev,
        [discussionId]: (prev[discussionId] || originalLikeCount) + 1,
      }));
      toast.success("Liked!");
    }
  };

  const handleDislike = (discussionId: number) => {
    if (!user) {
      toast.error("Please log in to dislike discussions");
      return;
    }

    const discussion = discussions.find((d) => d.id === discussionId);
    const originalDislikeCount = discussion?.dislikes || 0;

    if (userDislikedDiscussions.has(discussionId)) {
      // Undo dislike - decrement count by 1
      setUserDislikedDiscussions((prev) => {
        const newSet = new Set(prev);
        newSet.delete(discussionId);
        return newSet;
      });
      setDiscussionDislikeCounts((prev) => ({
        ...prev,
        [discussionId]: Math.max(0, (prev[discussionId] || originalDislikeCount) - 1),
      }));
      toast.success("Dislike removed");
    } else {
      // Add dislike - increment count by 1
      setUserDislikedDiscussions((prev) => new Set(prev).add(discussionId));
      setDiscussionDislikeCounts((prev) => ({
        ...prev,
        [discussionId]: (prev[discussionId] || originalDislikeCount) + 1,
      }));
      toast.success("Disliked!");
    }
  };

  const handleOpenDiscussion = (discussionId: number) => {
    setSelectedDiscussion(discussionId);
  };

  const handleCloseDiscussion = () => {
    setSelectedDiscussion(null);
  };

  const handleReplyAdded = (discussionId: number, reply: Reply) => {
    setDiscussionRepliesData((prev) => ({
      ...prev,
      [discussionId]: [...(prev[discussionId] || []), reply],
    }));
  };

  const handleCreatePost = (communityId: string, communityName: string) => {
    if (!user) {
      toast.error("Please log in to create posts");
      return;
    }
    if (!postTitle.trim() || !postContent.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    toast.success(`Post created in ${communityName}!`);
    setPostTitle("");
    setPostContent("");
    setShowPostForm(null);
  };

  const categories: Category[] = [
    {
      id: "crop-tips",
      name: "Crop Growing Tips",
      icon: <Leaf className="h-6 w-6" />,
      description: "Share and learn crop growing techniques and best practices",
      discussionCount: 256,
      memberCount: 1200,
    },
    {
      id: "fertilizer",
      name: "Fertilizer & Soil Health",
      icon: <TrendingUp className="h-6 w-6" />,
      description: "Discuss fertilizer recommendations and soil management",
      discussionCount: 189,
      memberCount: 950,
    },
    {
      id: "market-prices",
      name: "Market Prices & Trends",
      icon: <Award className="h-6 w-6" />,
      description: "Share market insights and price trends for different crops",
      discussionCount: 342,
      memberCount: 1500,
    },
    {
      id: "equipment",
      name: "Farm Equipment",
      icon: <Users className="h-6 w-6" />,
      description: "Discuss farming equipment and technology recommendations",
      discussionCount: 128,
      memberCount: 680,
    },
  ];

  const discussions: Discussion[] = [
    {
      id: 1,
      title: "Best practices for wheat cultivation in North India",
      category: "crop-tips",
      author: "Rajesh Kumar",
      avatar: "RK",
      replies: 24,
      views: 542,
      likes: 89,
      dislikes: 5,
      lastActive: "2 hours ago",
      preview: "I've been cultivating wheat for 15 years and would like to share some of my experiences...",
      content: "I've been cultivating wheat for 15 years in North India, and I'd like to share some valuable practices that have helped me achieve consistent yields. The key to successful wheat cultivation lies in proper preparation, timing, and management.\n\n**Soil Preparation:**\nPrepare your soil well before sowing. Use 2-3 passes of the plow to ensure proper tilth. Incorporate well-rotted farmyard manure or compost at least 4-6 weeks before sowing. This improves soil structure, water retention, and microbial activity.\n\n**Variety Selection:**\nChoose varieties suited to your agro-climatic zone. For North India, I recommend HD2967, HD3086, or PBW343 depending on your specific location. These have good resistance to common diseases and give consistent yields of 45-50 quintals per hectare.\n\n**Sowing Time:**\nOptimal sowing time is mid-October to mid-November. Timely sowing ensures proper tillering and grain filling. Late sowing reduces yield significantly.\n\n**Irrigation Schedule:**\nWheat requires 4-5 irrigations in North India:\n- First irrigation at crown root initiation (21 DAS)\n- Second irrigation at maximum tillering\n- Third at Zadox growth stage 30 (leaf emergence)\n- Fourth at grain filling stage\n\n**Pest & Disease Management:**\nMonitor regularly for Armyworm, Termites, and diseases like powdery mildew. Use integrated pest management practices to minimize chemical use.\n\nI hope these practices help you improve your yields. Feel free to ask any specific questions!",
    },
    {
      id: 2,
      title: "How to improve soil health naturally",
      category: "fertilizer",
      author: "Sita Devi",
      avatar: "SD",
      replies: 18,
      views: 423,
      likes: 67,
      dislikes: 3,
      lastActive: "4 hours ago",
      preview: "Natural methods have helped me increase my yields significantly without chemical fertilizers...",
      content: "Soil health is the foundation of sustainable and profitable farming. Through years of experimentation, I've found that natural methods can significantly improve soil fertility and crop yields.\n\n**Composting:**\nMake your own compost using crop residues, farm waste, and animal dung. A well-made compost pile can be ready in 3-4 months. Apply 5-10 tons per hectare annually to build soil organic matter.\n\n**Crop Residue Management:**\nDon't burn crop residues. Instead, incorporate them into the soil. Rice straw and wheat stubble decompose and add nutrients back to the soil. Use zero-till or minimum-till practices to preserve soil structure.\n\n**Green Manuring:**\nGrow legume crops like berseem, dhaincha, or moong as green manures. These nitrogen-fixing crops can be plowed in before the main crop. This reduces dependency on chemical nitrogen and improves soil structure.\n\n**Vermicomposting:**\nSet up vermicompost units at your farm. Earthworms break down organic matter quickly and produce rich compost. Apply vermicompost at 2-5 tons per hectare for best results.\n\n**Mulching:**\nUse dry grass, crop residues, or dried leaves as mulch around your crops. This conserves soil moisture, regulates temperature, and suppresses weeds naturally.\n\n**Microbial Inoculants:**\nUse bio-inoculants containing Azospirillum, Phosphobacteria, and mycorrhizae. These beneficial microbes enhance nutrient availability and plant growth.\n\nMy yields have increased by 20-25% using these methods while significantly reducing input costs.",
    },
    {
      id: 3,
      title: "Cotton prices trending upward - share your views",
      category: "market-prices",
      author: "Mohan Reddy",
      avatar: "MR",
      replies: 31,
      views: 876,
      likes: 112,
      dislikes: 8,
      lastActive: "1 hour ago",
      preview: "I've noticed cotton prices have been increasing. Has anyone else experienced this in their region?",
      content: "Cotton prices have been showing an upward trend for the past 2-3 months, and I'm curious to hear if others in the community are experiencing the same. Here's what I've observed:\n\n**Market Trends:**\nCotton prices in my region have increased from ₹4,500 per quintal to ₹5,200 per quintal. This is encouraging news for cotton farmers after a period of low prices. Global factors like reduced production in other countries and increased demand seem to be driving prices up.\n\n**Regional Variations:**\nPrices vary significantly by region and quality. Farmers in Maharashtra, Gujarat, and Telangana might be seeing different price points. If you're in a particular region, please share your current price range.\n\n**Quality Matters:**\nHigher quality cotton (staple length 28mm+, micronaire 3.5-4.9) commands premium prices. Invest in proper picking and ginning to maximize your returns.\n\n**Market Outlook:**\nExperts predict prices might remain stable or increase further if global supply remains tight. However, keep an eye on:\n- Global cotton production reports\n- Weather patterns affecting crop yields\n- Government policies and trade regulations\n- Currency fluctuations\n\n**Selling Strategy:**\nDon't rush to sell at the first price. Monitor prices for 2-3 weeks and sell when you feel comfortable. Store your cotton properly to avoid moisture damage.\n\nPlease share your local prices and experiences. This helps the entire community make better decisions.",
    },
    {
      id: 4,
      title: "Which tractor model is best for small farms?",
      category: "equipment",
      author: "Parvati Singh",
      avatar: "PS",
      replies: 15,
      views: 389,
      likes: 54,
      dislikes: 4,
      lastActive: "6 hours ago",
      preview: "Looking for a tractor recommendation for a 5-acre farm. Any suggestions from the community?",
      content: "I'm planning to buy a tractor for my 5-acre farm, and I'm finding it difficult to choose the right model. I've been looking at various options, and I'd appreciate suggestions from experienced farmers.\n\n**My Requirements:**\n- Farm size: 5 acres\n- Main crops: Wheat and Cotton\n- Budget: ₹5-7 lakhs\n- I need a tractor that's fuel-efficient and easy to maintain\n\n**What I'm Considering:**\n1. John Deere 5050D - Good resale value but slightly above budget\n2. Mahindra 475 - Affordable, good ground clearance\n3. TAFE 5500 - Reliable with good after-sales service\n\n**Key Factors I'm Thinking About:**\n- Horsepower (30-35 HP seems right for my size)\n- Fuel efficiency\n- After-sales service network\n- Availability of spare parts\n- Resale value\n\n**Questions:**\n1. Which model would be best for a 5-acre farm?\n2. What's the typical annual maintenance cost?\n3. Are there any models I should avoid?\n4. Should I consider diesel vs. petrol?\n5. Is financing available from dealers?\n\nI'd really appreciate practical advice from farmers who have experience with these models. Any suggestions or warnings based on your experience would be very helpful.",
    },
    {
      id: 5,
      title: "Dealing with pests using organic methods",
      category: "crop-tips",
      author: "Arjun Patel",
      avatar: "AP",
      replies: 22,
      views: 512,
      likes: 78,
      dislikes: 6,
      lastActive: "3 hours ago",
      preview: "Organic pest control methods have been game-changing for my farm...",
      content: "Pest management is one of the biggest challenges in farming, but I've found that organic methods can be incredibly effective without harming the environment or the soil. Here's what has worked for me:\n\n**Neem-Based Solutions:**\nNeem oil is a powerful pest deterrent. Mix neem oil with water and soap and spray on affected plants. It works against aphids, mites, whiteflies, and caterpillars. Apply in the evening for best results.\n\n**Beneficial Insects:**\nIntroduce beneficial insects like ladybugs, lacewings, and parasitic wasps. They feed on harmful pests naturally. You can attract them by planting flowers like marigold, fennel, and dill around your fields.\n\n**Botanical Pesticides:**\n- Garlic spray: Blend garlic with water and spray on plants\n- Chili spray: Mix chili powder with water for a natural deterrent\n- Turmeric powder: Dust on plants for fungal infections\n\n**Pheromone Traps:**\nUse species-specific pheromone traps to monitor and control pest populations. They're safe and environmentally friendly.\n\n**Crop Rotation:**\nRotate crops to break pest life cycles. This prevents pest buildup in the soil.\n\n**Manual Removal:**\nFor serious infestations, handpick larger pests early in the morning. Remove affected plant parts and dispose of them properly.\n\n**Companion Planting:**\nPlant marigold, mint, and basil near your main crops. These act as natural pest repellents.\n\n**Results:**\nI've successfully reduced chemical pesticide use by 80% while maintaining good yields. My soil health has improved significantly, and I notice more beneficial insects on my farm.\n\nThese methods require more attention but are worth it for long-term farm sustainability.",
    },
    {
      id: 6,
      title: "Seasonal crop rotation strategy for maximum yield",
      category: "crop-tips",
      author: "Lakshmi Sharma",
      avatar: "LS",
      replies: 19,
      views: 467,
      likes: 71,
      dislikes: 2,
      lastActive: "5 hours ago",
      preview: "I want to share my crop rotation strategy that has helped maintain soil fertility...",
      content: "Crop rotation is essential for maintaining soil health, managing pests, and maximizing yields. I'd like to share the successful rotation strategy I've implemented on my farm:\n\n**My Rotation Cycle (3 Years):**\n\n**Year 1: Cereal + Pulse System**\n- Kharif: Rice (June-October)\n- Rabi: Wheat + Gram intercropping (October-March)\n\n**Year 2: Commercial Crop**\n- Kharif: Cotton (June-October)\n- Rabi: Chickpea (October-March)\n\n**Year 3: Legume-Based**\n- Kharif: Soybean (June-October)\n- Rabi: Linseed (October-March)\n\n**Benefits I've Observed:**\n1. **Soil Nitrogen:** Pulses fix atmospheric nitrogen, reducing fertilizer needs\n2. **Pest Management:** Different crops break pest cycles, reducing disease pressure\n3. **Soil Structure:** Different root depths improve soil porosity and water retention\n4. **Weed Management:** Different crops suppress different weeds\n\n**Yield Impact:**\n- Wheat yield increased from 35 q/ha to 42 q/ha\n- Cotton yield improved from 15 bales/acre to 18 bales/acre\n- Reduced fertilizer costs by 25%\n- Reduced pesticide use by 30%\n\n**Key Principles:**\n1. Include legumes in every rotation\n2. Alternate deep-rooted and shallow-rooted crops\n3. Follow commodity crops with nutritionally demanding crops\n4. Monitor soil health annually\n\n**Challenges:**\n- Market availability of crop varieties\n- Weather unpredictability\n- Initial yield adjustment period\n\nI recommend doing a soil test every 2-3 years to track changes in soil fertility. This helps you fine-tune your rotation strategy.\n\nWould love to hear about other farmers' rotation strategies!",
    },
  ];

  const filteredDiscussions = discussions.filter((discussion) => {
    const matchesCategory = !selectedCategory || discussion.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      discussion.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      discussion.author.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <section className="bg-gradient-to-r from-primary/10 to-primary/5 border-b border-primary/10 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl sm:text-5xl font-display font-bold text-foreground mb-4">
                Farming Community Forum
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Connect with farmers worldwide, share experiences, and learn from collective wisdom
              </p>
            </motion.div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <div className="w-full sm:w-96 relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search discussions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <Button size="lg" className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Start Discussion
            </Button>
          </div>
        </div>
      </section>

      {/* Create Community & Feedback Section */}
      <section className="py-12 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <CreateCommunityWidget />
            <FeedbackWidget />
          </div>
        </div>
      </section>

      {/* My Communities Section */}
      {communities.length > 0 && (
        <section className="py-12 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-2">
                My Communities
              </h2>
              <p className="text-lg text-muted-foreground">
                Communities you've created or joined
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {communities.map((community, index) => (
                <motion.div
                  key={community.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: index * 0.05 }}
                >
                  <Card className="h-full hover:shadow-lg transition-all cursor-pointer group border-l-4 border-l-primary">
                    <CardHeader>
                      <div className="flex items-start justify-between mb-4">
                        <div className="h-12 w-12 rounded-lg bg-gradient-primary flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                          <Users className="h-6 w-6 text-primary-foreground" />
                        </div>
                        {community.location && (
                          <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full font-medium">
                            {community.location}
                          </span>
                        )}
                      </div>
                      <CardTitle className="text-xl group-hover:text-primary transition-colors line-clamp-2">
                        {community.name}
                      </CardTitle>
                      <CardDescription className="text-base mt-2 line-clamp-2">
                        {community.description || "No description provided"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {community.tags && community.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {community.tags.map((tag, idx) => (
                              <span
                                key={idx}
                                className="text-xs px-2 py-1 bg-secondary text-secondary-foreground rounded-full"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                          <div>
                            <p className="text-xs text-muted-foreground font-medium">Members</p>
                            <p className="text-2xl font-bold text-primary">
                              {community.member_count || 1}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground font-medium">Posts</p>
                            <p className="text-2xl font-bold text-primary">
                              {community.post_count || 0}
                            </p>
                          </div>
                        </div>
                        <Button
                          onClick={() => setShowPostForm(community.id)}
                          className="w-full mt-4 flex items-center gap-2"
                        >
                          <Plus className="h-4 w-4" />
                          Create Post
                        </Button>
                      </div>

                      {showPostForm === community.id && (
                        <div className="mt-4 pt-4 border-t border-border space-y-3">
                          <input
                            type="text"
                            placeholder="Post title..."
                            value={postTitle}
                            onChange={(e) => setPostTitle(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                          />
                          <textarea
                            placeholder="What's on your mind?"
                            value={postContent}
                            onChange={(e) => setPostContent(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm h-20 resize-none"
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleCreatePost(community.id, community.name)}
                              className="flex-1"
                            >
                              Post
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setShowPostForm(null)}
                              className="flex-1"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Main Content */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-4 gap-6">
            {/* Categories Sidebar */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Categories</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                        !selectedCategory
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted text-foreground"
                      }`}
                    >
                      All Discussions
                    </button>
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                          selectedCategory === category.id
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted text-foreground"
                        }`}
                      >
                        <span className="flex-shrink-0">{category.icon}</span>
                        <span className="text-sm font-medium truncate">{category.name}</span>
                      </button>
                    ))}
                  </CardContent>
                </Card>

                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="text-lg">Community Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Members</p>
                      <p className="text-2xl font-bold text-primary">4,330</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Active Discussions</p>
                      <p className="text-2xl font-bold text-primary">915</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Posts</p>
                      <p className="text-2xl font-bold text-primary">12,456</p>
                    </div>
                  </CardContent>
                </Card>

                <div className="mt-6">
                  <LocalChallenges />
                </div>
              </motion.div>
            </div>

            {/* Discussions List */}
            <div className="lg:col-span-3">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="space-y-4"
              >
                {filteredDiscussions.length > 0 ? (
                  filteredDiscussions.map((discussion, index) => (
                    <motion.div
                      key={discussion.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.45, delay: index * 0.05 }}
                    >
                      <Card
                        onClick={() => handleOpenDiscussion(discussion.id)}
                        className="hover:shadow-lg transition-all cursor-pointer group"
                      >
                        <CardContent className="pt-6">
                          <div className="flex gap-4">
                            <div className="h-12 w-12 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0">
                              <span className="text-sm font-bold text-primary-foreground">
                                {discussion.avatar}
                              </span>
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors truncate cursor-pointer">
                                    {discussion.title}
                                  </h3>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    by <span className="font-medium text-foreground">{discussion.author}</span> in{" "}
                                    <span className="font-medium text-foreground">
                                      {categories.find((c) => c.id === discussion.category)?.name}
                                    </span>
                                  </p>
                                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                                    {discussion.preview}
                                  </p>
                                </div>

                                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                                  <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full font-medium">
                                    {categories.find((c) => c.id === discussion.category)?.name}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {discussion.lastActive}
                                  </span>
                                </div>
                              </div>

                              <div className="flex gap-6 mt-4 text-xs">
                                <div className="flex items-center gap-1 text-muted-foreground">
                                  <MessageCircle className="h-4 w-4" />
                                  <span>{(discussionRepliesData[discussion.id]?.length || discussion.replies)} replies</span>
                                </div>
                                <div className="flex items-center gap-1 text-muted-foreground">
                                  <Users className="h-4 w-4" />
                                  <span>{discussion.views} views</span>
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleLike(discussion.id);
                                  }}
                                  className={`flex items-center gap-1 transition-colors cursor-pointer ${
                                    userLikedDiscussions.has(discussion.id)
                                      ? "text-green-600 font-semibold"
                                      : "text-muted-foreground hover:text-primary"
                                  }`}
                                  title={userLikedDiscussions.has(discussion.id) ? "Click to unlike" : "Click to like"}
                                >
                                  <ThumbsUp className="h-4 w-4" />
                                  <span>{(discussionLikeCounts[discussion.id] || discussion.likes)} likes</span>
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDislike(discussion.id);
                                  }}
                                  className={`flex items-center gap-1 transition-colors cursor-pointer ${
                                    userDislikedDiscussions.has(discussion.id)
                                      ? "text-red-600 font-semibold"
                                      : "text-muted-foreground hover:text-primary"
                                  }`}
                                  title={userDislikedDiscussions.has(discussion.id) ? "Click to remove dislike" : "Click to dislike"}
                                >
                                  <ThumbsUp className="h-4 w-4 rotate-180" />
                                  <span>{(discussionDislikeCounts[discussion.id] || discussion.dislikes)} dislikes</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))
                ) : (
                  <Card>
                    <CardContent className="pt-12 pb-12 text-center">
                      <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                      <p className="text-muted-foreground">No discussions found matching your search</p>
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories Grid */}
      <section className="py-12 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-4">
              Explore Categories
            </h2>
            <p className="text-lg text-muted-foreground">
              Find discussions and connect with farmers in your area of interest
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
                onClick={() => setSelectedCategory(category.id)}
                className="cursor-pointer group"
              >
                <Card className="h-full hover:shadow-lg transition-all group-hover:border-primary">
                  <CardHeader>
                    <div className="h-14 w-14 rounded-xl bg-gradient-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <span className="text-primary-foreground">{category.icon}</span>
                    </div>
                    <CardTitle className="text-xl group-hover:text-primary transition-colors">
                      {category.name}
                    </CardTitle>
                    <CardDescription className="text-base">
                      {category.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Discussions</span>
                        <span className="font-semibold text-foreground">
                          {category.discussionCount}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Members</span>
                        <span className="font-semibold text-foreground">
                          {category.memberCount}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-primary-foreground mb-6">
              Ready to Join the Conversation?
            </h2>
            <p className="text-lg text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
              Share your experiences, ask questions, and learn from thousands of farmers in our community.
            </p>
            <Button size="lg" variant="accent" className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Start Your First Discussion
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Discussion Detail Full Page View */}
      {selectedDiscussion !== null && (
        <DiscussionDetail
          discussion={discussions.find((d) => d.id === selectedDiscussion)!}
          replies={discussionRepliesData[selectedDiscussion] || []}
          onClose={handleCloseDiscussion}
          onReplyAdded={(reply) => handleReplyAdded(selectedDiscussion, reply)}
          onLike={handleLike}
          onDislike={handleDislike}
          userLiked={userLikedDiscussions.has(selectedDiscussion)}
          userDisliked={userDislikedDiscussions.has(selectedDiscussion)}
          likeCount={discussionLikeCounts[selectedDiscussion] || discussions.find((d) => d.id === selectedDiscussion)?.likes || 0}
          dislikeCount={discussionDislikeCounts[selectedDiscussion] || discussions.find((d) => d.id === selectedDiscussion)?.dislikes || 0}
        />
      )}
    </div>
  );
}
